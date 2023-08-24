import axios from "axios";

export const loadShader = async (shaderAddress: string) => {
  return await axios.get(shaderAddress).then((res) => {
    return res.data;
  });
};
