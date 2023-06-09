package heartbeat.service.report;

import com.opencsv.bean.CsvBindByName;
import com.opencsv.bean.HeaderColumnNameTranslateMappingStrategy;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

public class CustomMappingStrategy<T> extends HeaderColumnNameTranslateMappingStrategy<T> {

	private Map<String, String> columnMap = new HashMap<>();

	private String[] headerOrder;

	public CustomMappingStrategy(Class<? extends T> clazz, String[] headerOrder) {
		this.headerOrder = headerOrder;
		for (Field field : clazz.getDeclaredFields()) {
			CsvBindByName annotation = field.getAnnotation(CsvBindByName.class);
			if (annotation != null) {
				columnMap.put(field.getName(), annotation.column());
			}
		}
		setType(clazz);
	}

	@Override
	public String getColumnName(int col) {
		return headerIndex.getByPosition(col);
	}

	@Override
	public String[] generateHeader(T bean) {
		String[] result = new String[headerOrder.length];
		for (int i = 0; i < headerOrder.length; i++) {
			String propertyName = columnMap.get(headerIndex.getByPosition(i));
			result[i] = propertyName != null ? propertyName : headerOrder[i];
		}
		return result;
	}

}
