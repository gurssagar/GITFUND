module.exports = {
  theme: {
    extend: {
      keyframes: {
        flip: {
          to: { transform: "rotate(360deg)" },
        },
        rotate: {
          to: { transform: "rotate(90deg)" },
        },
      },
      animation: {
        flip: "flip 6s infinite steps(2, end)",
        rotate: "rotate 3s linear infinite",
      },
    },
  },
};
