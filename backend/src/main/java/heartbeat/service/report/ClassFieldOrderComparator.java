package heartbeat.service.report;

import org.apache.commons.lang3.ArrayUtils;

import java.util.Comparator;

public class ClassFieldOrderComparator implements Comparator<String> {
    private final String[] header;

    public ClassFieldOrderComparator(String[] header) {
        this.header = header;
    }

    @Override
    public int compare(String o1, String o2) {
        int indexO1 = ArrayUtils.indexOf(header, o1);
        int indexO2 = ArrayUtils.indexOf(header, o2);
        return Integer.compare(indexO1, indexO2);
    }
}

