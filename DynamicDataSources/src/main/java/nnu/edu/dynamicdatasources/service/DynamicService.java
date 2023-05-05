package nnu.edu.dynamicdatasources.service;

import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 *
 * @Author: Yiming
 * @Date: 2023/05/05/21:36
 * @Description:
 */
public interface DynamicService {
    List<Map<String, Object>> queryAll(String datasourceId, String tableName);
}
