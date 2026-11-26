import { useEffect, useState } from "react";
import QRCode from "qrcode";

type TipQrProps = {
  value: string;
  size?: number;
  className?: string;
  light?: boolean;
};

export function TipQr({ value, size = 116, className = "", light = false }: TipQrProps) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value || "https://ko-fi.com/estebanbermudez", {
      width: size * 2,
      margin: 1,
      color: { dark: light ? "#fffaf0" : "#25352f", light: light ? "#315c4e" : "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (active) setSrc(url);
      })
      .catch(() => {
        if (active) setSrc("");
      });
    return () => {
      active = false;
    };
  }, [value, size, light]);

  if (!src) {
    return <div className={`qr-placeholder ${className}`} style={{ width: size, height: size }}>KO-FI QR</div>;
  }

  return (
    <img
      className={className}
      src={src}
      width={size}
      height={size}
      alt="Ko-fi tip QR code for an optional tip"
    />
  );
}
