package nnu.edu.nettydemo.netty;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;

/**
 * Created with IntelliJ IDEA.
 *
 * @Author: Yiming
 * @Date: 2023/03/22/14:42
 * @Description:
 */
public class NettyServer {
    public void bind(int port) throws InterruptedException {
        /**
         * 	配置服务端的NIO线程组
         * 	NioEventLoopGroup 是用来处理I/O操作的Reactor线程组
         * 	bossGroup：用来接收进来的连接，workerGroup：用来处理已经被接收的连接,进行socketChannel的网络读写，
         * 	bossGroup接收到连接后就会把连接信息注册到workerGroup
         * 	workerGroup的EventLoopGroup默认的线程数是CPU核数的二倍
         */
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            /**
             * ServerBootstrap 是一个启动NIO服务的辅助启动类
             */
            ServerBootstrap serverBootstrap = new ServerBootstrap();
            /**
             * 	设置group，将bossGroup， workerGroup线程组传递到ServerBootstrap
             */
            serverBootstrap = serverBootstrap.group(bossGroup, workerGroup);
            /**
             * ServerSocketChannel是以NIO的selector为基础进行实现的，用来接收新的连接，这里告诉Channel通过NioServerSocketChannel获取新的连接
             */
            serverBootstrap = serverBootstrap.channel(NioServerSocketChannel.class);

            //  option是设置 bossGroup，childOption是设置workerGroup

            /**
             * 服务端接受连接的队列长度，如果队列已满，客户端连接将被拒绝(队列被接收后，拒绝的客户端下次连接上来只要队列有空余就能连上)
             */
            serverBootstrap = serverBootstrap.option(ChannelOption.SO_BACKLOG, 64);
            /**
             * 立即发送数据，默认值为Ture（Netty默认为True而操作系统默认为False）。
             * 该值设置Nagle算法的启用，改算法将小的碎片数据连接成更大的报文来最小化所发送的报文的数量，如果需要发送一些较小的报文，则需要禁用该算法。
             * Netty默认禁用该算法，从而最小化报文传输延时。
             */
            serverBootstrap = serverBootstrap.childOption(ChannelOption.TCP_NODELAY, true);
            /**
             * 连接保活，默认值为False。启用该功能时，TCP会主动探测空闲连接的有效性。
             * 可以将此功能视为TCP的心跳机制，默认的心跳间隔是7200s即2小时, Netty默认关闭该功能。
             */
            serverBootstrap = serverBootstrap.childOption(ChannelOption.SO_KEEPALIVE, true);
            /**
             * 设置 I/O处理类,主要用于网络I/O事件，记录日志，编码、解码消息
             */
            serverBootstrap = serverBootstrap.childHandler(new BootNettyChannelInitializer<SocketChannel>());
            ChannelFuture f = serverBootstrap.bind(port).sync();
            if(f.isSuccess()){
                System.out.println("netty server start success!");
                /**
                 * 等待服务器监听端口关闭
                 */
                f.channel().closeFuture().sync();
            }
        } catch (Exception e) {
            System.out.println(e.toString());
        } finally {
            /**
             * 退出，释放线程池资源
             */
            bossGroup.shutdownGracefully().sync();
            workerGroup.shutdownGracefully().sync();
        }

    }
}
