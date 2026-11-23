import type React from "react";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        ar?: boolean;
        "ar-modes"?: string;
        "ar-scale"?: string;
        "ar-placement"?: string;
        "camera-controls"?: boolean | string;
        "auto-rotate"?: boolean | string;
        "shadow-intensity"?: string;
        "environment-image"?: string;
        exposure?: string;
        alt?: string;
      };
    }
  }
}
