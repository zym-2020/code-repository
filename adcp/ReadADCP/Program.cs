using System;
using System.IO;
using System.Data;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReadADCP
{
    class Program
    {
        static int Main(string[] args)
        {
            String openFile = "D:\\zhuomian\\ADCP测试0423\\BMS1_D_002.PD0";// 选择读取的文件
            String writeFile = "D:\\zhuomian\\ADCP测试0423\\BMS1_D_002_OUT.txt";  //需要写入的文本
            FileStream filewrite = new FileStream(writeFile, FileMode.Create);
            filewrite.Flush();
            filewrite.Close();
            //

            FileStream fs = new FileStream(openFile, FileMode.Open);// 读取方式打开，得到流
            fs.Seek(0, SeekOrigin.Begin);

            byte[] certainId = new byte[2];           // 记录头文件id;
            byte[] uniondata = new byte[2];           // 测量集合byte数 
            byte[] typeId = new byte[2];              // 记录头文件id;
            byte[] addressmoveId = new byte[2];       //地址偏移量
            byte[] sustainId = new byte[2];           //固定头文件id
            byte[] sustaindataId = new byte[52];      //固定头数据id
            byte[] changeHeaderId = new byte[65];       //可变头数据Id


            fs.Read(certainId, 0, certainId.Length); //得到头文件id的字节
            //判断字节是否为7Fh 看格式有没有问题 
            char[] judge = Encoding.UTF8.GetChars(certainId);
            int headerid = judge[0];
            int datasourceid = judge[1];
            if (!(headerid == datasourceid && headerid == 127))
            {
                return 0;
            }

            // 得到本次测量集合的Byte数
            fs.Seek(2, SeekOrigin.Begin);    // 移动
            fs.Read(uniondata, 0, uniondata.Length); //得到集合数的byte;
            int unionCount = System.BitConverter.ToInt16(uniondata, 0); //得到测量集合的byte数

            //得到保留和数据类型的偏移量
            fs.Seek(4, SeekOrigin.Begin);
            fs.Read(typeId, 0, typeId.Length);
            char[] saveDatatype = Encoding.UTF8.GetChars(typeId);
            int saveid = saveDatatype[0];
            int datatypeid = saveDatatype[1]; //数据类型个数

            //开始写入测量集合 保留 数据类型的个数
            StreamWriter sw = new StreamWriter(writeFile, false);
            sw.WriteLine(String.Format("测量集合的byte数：{0}\n", unionCount)); //换行
            sw.WriteLine(String.Format("保留:{0}\n", saveid));  //保留
            sw.WriteLine(String.Format("数据类型个数:{0}\n", datatypeid));  //数据类型id

            //得到数据类型的偏移量
            for (int i = 0; i < datatypeid; i++)
            {
                fs.Seek(2 * i + 6, SeekOrigin.Begin);
                fs.Read(addressmoveId, 0, addressmoveId.Length);
                int addressmove = System.BitConverter.ToInt16(addressmoveId, 0);
                sw.WriteLine(String.Format("数据类型{0}的地址偏移量:{1}\n", i + 1, addressmove));  //数据类型地址偏移量
            }

            // 固定头数据
            sw.WriteLine("\n固定头\n");                      //数据类型地址偏移量
            fs.Seek(6 + datatypeid * 2, SeekOrigin.Begin);
            fs.Read(sustainId, 0, sustainId.Length); //得到固定头文件id的字节
            //判断字节是否为0 看格式有没有问题 
            char[] sustainJudge = Encoding.UTF8.GetChars(sustainId);
            int sustainHeader1 = sustainJudge[0];
            int sustainHeader2 = sustainJudge[1];
            if (!(sustainHeader1 == sustainHeader2 && sustainHeader1 == 0))
            {
                return 0;
            }

            fs.Read(sustaindataId, 0, sustaindataId.Length); //得到固定头剩余数据的字节
            char[] sustainAllId = Encoding.UTF8.GetChars(sustaindataId);
            int cpuEdition = sustainAllId[0];   //cpu版本号
            int cpuModify = sustainAllId[1];    //cpu修订号
            int streamNums = sustainAllId[7];    //流层数
            Console.WriteLine(String.Format("流层数:{0}", streamNums));

            //可变头数据
            fs.Seek(6 + datatypeid * 2 + 59, SeekOrigin.Begin);
            fs.Read(changeHeaderId, 0, changeHeaderId.Length);
            char[] systemtime = Encoding.UTF8.GetChars(changeHeaderId);

            int years = systemtime[4];
            int month = systemtime[5];
            int day = systemtime[6];
            int hour = systemtime[7];
            int minute = systemtime[8];
            int second = systemtime[9];
            Console.WriteLine(String.Format("系统实时时钟{0}年{1}月{2}日{3}时{4}分{5}秒\n", years, month, day, hour, minute, second));

            //流速数据
            fs.Seek(6 + datatypeid * 2 + 59 + 65, SeekOrigin.Begin);
            byte[] speedId = new byte[2];
            fs.Read(speedId, 0, speedId.Length);  //读取速度id
            byte[] streamspeedId = new byte[2];         //流速数据   
            for (int k = 0; k < streamNums; k++)
            {
                for (int m = 0; m < 4; m++)
                {
                    fs.Read(streamspeedId, 0, streamspeedId.Length);
                    int streamspeedvalue = System.BitConverter.ToInt16(streamspeedId, 0);
                    sw.WriteLine(String.Format("流层{0},速度{1}:{2}(mm/s) \n", k + 1, m + 1, streamspeedvalue));  //数据类型id
                }
            }

            //回波强度数据
            sw.WriteLine(String.Format("回波强度数据\n"));
            fs.Seek(6 + datatypeid * 2 + 59 + 65 + 2 + 8 * streamNums, SeekOrigin.Begin);
            byte[] echolengthId = new byte[2];
            fs.Read(echolengthId, 0, echolengthId.Length);
            int echolengthValue = System.BitConverter.ToInt16(echolengthId, 0);
            sw.WriteLine(String.Format("ID,相关系数、回波长度不同的ID值:{0}\n", echolengthValue));
            byte[] echoPercent = new byte[2];
            for (int p = 0; p < streamNums; p++)
            {
                for (int q = 0; q < 4; q++)
                {
                    fs.Read(echoPercent, 0, echoPercent.Length);
                    int echoPercentvalue = System.BitConverter.ToInt16(echoPercent, 0);
                    sw.WriteLine(String.Format("流层{0},波速{1}的相关系数/回波强度:{2}\n", p + 1, q + 1, echoPercentvalue));  //数据类型id
                }
            }
            sw.Close();//写完需要关闭

            return 0;
        }
    }
}
