const transformation = (angle, translateX, translateY, positionX, positionY) => {
  const x = Math.cos(angle) * positionX - Math.sin(angle) * positionY + translateX;
  const y = Math.sin(angle) * positionX + Math.cos(angle) * positionY + translateY;
  console.log(x, y);
};

transformation(Math.PI / 4, 1, 2, 2, 1);
