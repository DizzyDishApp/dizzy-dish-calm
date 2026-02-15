/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#FAF6F1",
        card: "#FFFFFF",
        warm: {
          DEFAULT: "#C65D3D",
          light: "#E8BBA8",
          pale: "#FDF0EB",
          dark: "#B04E32",
        },
        green: {
          DEFAULT: "#5B8C6A",
          light: "#E4EFE7",
        },
        instacart: "#108910",
        cream: "#F5EDE5",
        border: "#E8E3DD",
        txt: {
          DEFAULT: "#2D2A26",
          soft: "#8C857D",
          light: "#B8B2AA",
        },
      },
      fontFamily: {
        display: ["Fraunces_700Bold"],
        "display-semibold": ["Fraunces_600SemiBold"],
        "display-italic": ["Fraunces_400Regular_Italic"],
        "display-bold-italic": ["Fraunces_700Bold_Italic"],
        body: ["PlusJakartaSans_400Regular"],
        "body-medium": ["PlusJakartaSans_500Medium"],
        "body-semibold": ["PlusJakartaSans_600SemiBold"],
        "body-bold": ["PlusJakartaSans_700Bold"],
        "body-extrabold": ["PlusJakartaSans_800ExtraBold"],
        "body-light": ["PlusJakartaSans_300Light"],
      },
      borderRadius: {
        input: "12px",
        card: "14px",
        pill: "20px",
        social: "28px",
        btn: "50px",
      },
      spacing: {
        micro: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        hero: "40px",
      },
    },
  },
  plugins: [],
};
