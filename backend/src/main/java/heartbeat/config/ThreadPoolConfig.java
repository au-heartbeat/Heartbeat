package heartbeat.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.ThreadPoolExecutor;

@Configuration
public class ThreadPoolConfig {

	@Bean("customTaskExecutor")
	public ThreadPoolTaskExecutor taskExecutor() {
		ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
		executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
		int numOfCores = Runtime.getRuntime().availableProcessors();

		int tempCorePoolSize = numOfCores - 3;
		int corePoolSize = tempCorePoolSize < 0 ? 0 : tempCorePoolSize;
		int tempMaxPoolSize = numOfCores - 1;
		int maxPoolSize = tempMaxPoolSize < 0 ? 0 : tempMaxPoolSize;

		executor.setCorePoolSize(corePoolSize);
		executor.setMaxPoolSize(maxPoolSize);
		executor.setQueueCapacity(1000);
		executor.setKeepAliveSeconds(60);
		executor.setThreadNamePrefix("Heartbeat-");
		executor.initialize();
		return executor;
	}

}
