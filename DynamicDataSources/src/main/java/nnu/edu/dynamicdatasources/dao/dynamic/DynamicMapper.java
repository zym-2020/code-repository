package nnu.edu.dynamicdatasources.dao.dynamic;

import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 *
 * @Author: Yiming
 * @Date: 2023/05/05/20:43
 * @Description:
 */
@Repository
public interface DynamicMapper {
    List<Map<String, Object>> queryAll(String datasourceId, @Param("tableName") String tableName);
}
