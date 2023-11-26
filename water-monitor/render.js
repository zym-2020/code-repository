const information = document.getElementById("info");
information.innerText = `本应用正在使用 Chrome (v${myVersion.chrome()}), Node.js (v${myVersion.node()}), 和 Electron (v${myVersion.electron()})`;

const func = async () => {
  console.log("123");
  const response = await api.ping();
  console.log(response); // 打印 'pong'
};

func();
