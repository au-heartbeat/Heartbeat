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
		executor.setCorePoolSize(20);
		executor.setMaxPoolSize(100);
		executor.setQueueCapacity(1000);
		executor.setKeepAliveSeconds(60);
		executor.setThreadNamePrefix("Heartbeat-");
		executor.initialize();
		return executor;
	}

}
