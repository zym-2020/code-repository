package nnu.edu.dynamicdatasources.common.aspect;

import nnu.edu.dynamicdatasources.common.config.DataSourceContextHolder;
import nnu.edu.dynamicdatasources.common.config.DynamicDataSource;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.sqlite.JDBC;

import javax.sql.DataSource;

/**
 * Created with IntelliJ IDEA.
 *
 * @Author: Yiming
 * @Date: 2023/05/05/20:47
 * @Description:
 */
@Order(1)
@Aspect
@Component
public class DynamicDataSourceAspect {

    private DynamicDataSource dynamicDataSource = new DynamicDataSource();

    /**
     * 切换数据源
     */
    @Before("execution(* nnu.edu.dynamicdatasources.dao.dynamic.*.*(..))")
    public void switchDataSource(JoinPoint joinPoint) {
        System.out.println("切换数据源");
        Object[] args = joinPoint.getArgs();
        String datasourceId = (String) args[0];
        if (!DataSourceContextHolder.containDataSourceKey(datasourceId)) {
            DataSourceBuilder dataSourceBuilder = DataSourceBuilder.create();
            dataSourceBuilder.url("jdbc:sqlite:D:/zhuomian/test1.db");
            dataSourceBuilder.driverClassName(JDBC.class.getName());
            DataSource source = dataSourceBuilder.build();
            dynamicDataSource.addDataSource(datasourceId, source);
        }
        // 切换数据源
        DataSourceContextHolder.setDataSourceKey(datasourceId);
        System.out.println(DataSourceContextHolder.getDataSourceKey());
    }

    /**
     * 重置数据源
     */
    @After("execution(* nnu.edu.dynamicdatasources.dao.dynamic.*.*(..))")
    public void restoreDataSource() {
        // 将数据源置为默认数据源
        System.out.println("重置数据源");
        DataSourceContextHolder.clearDataSourceKey();
    }

}
