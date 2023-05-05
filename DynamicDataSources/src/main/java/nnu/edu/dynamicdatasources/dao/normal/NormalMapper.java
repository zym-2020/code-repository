package nnu.edu.dynamicdatasources.dao.normal;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 *
 * @Author: Yiming
 * @Date: 2023/05/05/22:24
 * @Description:
 */
@Repository
public interface NormalMapper {
    List<Map<String, Object>> queryAll();
}
