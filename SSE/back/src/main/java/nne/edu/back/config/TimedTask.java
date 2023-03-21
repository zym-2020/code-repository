package nne.edu.back.config;

import nne.edu.back.controller.SSEController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Created with IntelliJ IDEA.
 *
 * @Author: Yiming
 * @Date: 2023/03/21/22:16
 * @Description:
 */
@Component
public class TimedTask {
    @Autowired
    SSEController sseController;

    @Scheduled(cron = "30,40 8 * * * ?")
    public void sendMassage() throws IOException {
        System.out.println("123");
        sseController.message("123", "哈哈哈");
    }

    @Scheduled(cron = "0 9 * * * ?")
    public void over() throws IOException {
        System.out.println("456");
        sseController.over("123");
    }
}
