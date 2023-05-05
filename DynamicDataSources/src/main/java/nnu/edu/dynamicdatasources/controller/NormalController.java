package nnu.edu.dynamicdatasources.controller;

import nnu.edu.dynamicdatasources.service.NormalService;
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
 * @Date: 2023/05/05/22:23
 * @Description:
 */
@RestController
@RequestMapping("/normal")
public class NormalController {
    @Autowired
    NormalService normalService;

    @RequestMapping(value = "/test", method = RequestMethod.GET)
    public List<Map<String, Object>> queryAll() {
        return normalService.queryAll();
    }
}
