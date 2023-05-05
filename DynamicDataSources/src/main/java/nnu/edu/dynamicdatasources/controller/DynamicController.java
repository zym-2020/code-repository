package nnu.edu.dynamicdatasources.controller;

import nnu.edu.dynamicdatasources.service.DynamicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 *
 * @Author: Yiming
 * @Date: 2023/05/05/21:35
 * @Description:
 */
@RestController
@RequestMapping("/dynamic")
public class DynamicController {
    @Autowired
    DynamicService dynamicService;

    @RequestMapping(value = "/test", method = RequestMethod.GET)
    public List<Map<String, Object>> queryAll() {
        return dynamicService.queryAll("123", "test");
    }
}
