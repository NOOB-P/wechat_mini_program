package com.edu.javasb_back.model.vo;

import lombok.Data;
import java.util.List;

@Data
public class SchoolNodeVO {
    private String id;
    private String name;
    private String type; // 'province', 'city', 'school', 'grade', 'class'
    private List<SchoolNodeVO> children;

    public SchoolNodeVO(String id, String name, String type) {
        this.id = id;
        this.name = name;
        this.type = type;
    }
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public List<SchoolNodeVO> getChildren() { return children; }
    public void setChildren(List<SchoolNodeVO> children) { this.children = children; }
}