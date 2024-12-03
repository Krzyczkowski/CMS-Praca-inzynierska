package krzyczkowski.cms.core.models;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString
public class LoadTimeData {
    private String websiteName;
    private Long loadTime;
}
