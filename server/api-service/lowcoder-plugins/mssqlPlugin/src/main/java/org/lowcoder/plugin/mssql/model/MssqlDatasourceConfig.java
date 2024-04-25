package org.lowcoder.plugin.mssql.model;

import static org.lowcoder.sdk.util.ExceptionUtils.ofPluginException;
import static org.lowcoder.sdk.util.JsonUtils.fromJson;
import static org.lowcoder.sdk.util.JsonUtils.toJson;

import java.util.Map;

import org.lowcoder.sdk.exception.PluginCommonError;
import org.lowcoder.sdk.plugin.common.sql.SqlBasedDatasourceConnectionConfig;

import lombok.Builder;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class MssqlDatasourceConfig extends SqlBasedDatasourceConnectionConfig {

    private static final long DEFAULT_PORT = 1433L;

    @Builder
    public MssqlDatasourceConfig(String database, String username, String password, String host, Long port, boolean usingSsl, String serverTimezone,
            boolean isReadonly, boolean enableTurnOffPreparedStatement, Map<String, Object> extParams) {
        super(database, username, password, host, port, usingSsl, serverTimezone, isReadonly, enableTurnOffPreparedStatement, extParams);
    }

    @Override
    protected long defaultPort() {
        return DEFAULT_PORT;
    }

    public static MssqlDatasourceConfig buildFrom(Map<String, Object> requestMap) {
        MssqlDatasourceConfig result = fromJson(toJson(requestMap), MssqlDatasourceConfig.class);
        if (result == null) {
            throw ofPluginException(PluginCommonError.DATASOURCE_ARGUMENT_ERROR, "INVALID_SQLSERVER_CONFIG");
        }
        return result;
    }
}
