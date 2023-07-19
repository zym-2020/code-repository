addEventListener("message", (e) => {
  const msg = e.data;
  console.log(msg);
  postMessage(msg);
  close();
});

export default {};
