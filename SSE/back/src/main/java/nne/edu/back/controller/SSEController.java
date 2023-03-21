package nne.edu.back.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created with IntelliJ IDEA.
 *
 * @Author: Yiming
 * @Date: 2023/03/21/21:45
 * @Description:
 */
@RequestMapping("/SSE")
@RestController
public class SSEController {
    private static Map<String, SseEmitter> sseCache = new ConcurrentHashMap<>();

    @CrossOrigin
    @RequestMapping(value = "/subscribe/{id}", method = RequestMethod.GET)
    public SseEmitter subscribe(@PathVariable String id) throws IOException {
        SseEmitter sseEmitter = new SseEmitter(1000 * 60 * 60L);
        sseEmitter.send(SseEmitter.event().name("msg").data("连接成功"));
        sseCache.put(id, sseEmitter);
        sseEmitter.onTimeout(() -> {
            System.out.println(id + "超时");
            sseEmitter.complete();
            sseCache.remove(id);

        });
        return sseEmitter;
    }

    public void over(@PathVariable String id) throws IOException {
        SseEmitter sseEmitter = sseCache.get(id);
        if (sseEmitter != null) {
            sseEmitter.send(SseEmitter.event().name("msg").data("结束了!"));
            sseEmitter.complete();
            sseCache.remove(id);
        }
    }

    public void message(@PathVariable String id, String content) throws IOException {
        SseEmitter sseEmitter = sseCache.get(id);
        if (sseEmitter != null) {
            sseEmitter.send(SseEmitter.event().name("msg").data("后端发送消息：" + content));
        }
    }
}
