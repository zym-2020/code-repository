const net = require("net");

const buffer = Buffer.from(
  "���� ~�`` ��  x �����x     ����� f �� �� � �   ~  � �`    �f�  `` �f� �� ��~~~x   ��  � ~���� ``  ~ ~``�f� ~   ~   ~��x�~�  x���  x���``x��ff����`f     ���f�xf   �    ```�`f� ~ �f��� ` ��f��� ��                                                                                                                                                                                                   � f� ���~x  x��  ��  xf�f  ��  �~  �~�f  �f�   ��  �x�  �               ~�   �   �   �   �   �   �   �           �  ���f���x���f�x�����`��������� ����fff�x����f�fffx�f�ff��~�f`�~�x��~�xff��xf�������`�����`x���`x怆�xx��`xf��x�x� xf��x��x�x� x�x����x��  `�`  f� ff   `�   `�   `�   `�   `�   `�   `�   `�   `�   `�   `�   `�   `�   `�   `�   `�   `�   `�   `�   `�   `�   `�   `�   `� ��f ������  �   ~��~`���昘f�"
);

for (let i = 0; i < buffer.length; i++) {
  //   console.log(buffer[i].toString());
}


// console.log(buffer.toString());
console.log(buffer.toString("hex"));
