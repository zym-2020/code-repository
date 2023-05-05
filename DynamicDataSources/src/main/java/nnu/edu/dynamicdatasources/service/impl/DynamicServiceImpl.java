package nnu.edu.dynamicdatasources.service.impl;

import nnu.edu.dynamicdatasources.dao.dynamic.DynamicMapper;
import nnu.edu.dynamicdatasources.service.DynamicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 *
 * @Author: Yiming
 * @Date: 2023/05/05/21:36
 * @Description:
 */
@Service
public class DynamicServiceImpl implements DynamicService {
    @Autowired
    DynamicMapper dynamicMapper;

    @Override
    public List<Map<String, Object>> queryAll(String datasourceId, String tableName) {
        System.out.println("haha");
        return dynamicMapper.queryAll(datasourceId, tableName);
    }
}
