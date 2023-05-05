package nnu.edu.dynamicdatasources.service.impl;

import nnu.edu.dynamicdatasources.dao.normal.NormalMapper;
import nnu.edu.dynamicdatasources.service.NormalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 *
 * @Author: Yiming
 * @Date: 2023/05/05/22:25
 * @Description:
 */
@Service
public class NormalServiceImpl implements NormalService {
    @Autowired
    NormalMapper normalMapper;

    @Override
    public List<Map<String, Object>> queryAll() {
        return normalMapper.queryAll();
    }
}
