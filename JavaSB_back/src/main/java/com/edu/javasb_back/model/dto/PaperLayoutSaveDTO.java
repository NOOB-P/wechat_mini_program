package com.edu.javasb_back.model.dto;

import java.util.List;

public class PaperLayoutSaveDTO {

    private String projectId;
    private String subjectName;
    private String type;
    private List<PaperRegionDTO> regions;

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public List<PaperRegionDTO> getRegions() { return regions; }
    public void setRegions(List<PaperRegionDTO> regions) { this.regions = regions; }

    public static class PaperRegionDTO {
        private String id;
        private String questionNo;
        private String questionType;
        private String knowledgePoint;
        private String questionText;
        private Double score;
        private Integer sortOrder;
        private Double x;
        private Double y;
        private Double width;
        private Double height;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getQuestionNo() { return questionNo; }
        public void setQuestionNo(String questionNo) { this.questionNo = questionNo; }

        public String getQuestionType() { return questionType; }
        public void setQuestionType(String questionType) { this.questionType = questionType; }

        public String getKnowledgePoint() { return knowledgePoint; }
        public void setKnowledgePoint(String knowledgePoint) { this.knowledgePoint = knowledgePoint; }

        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }

        public Double getScore() { return score; }
        public void setScore(Double score) { this.score = score; }

        public Integer getSortOrder() { return sortOrder; }
        public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

        public Double getX() { return x; }
        public void setX(Double x) { this.x = x; }

        public Double getY() { return y; }
        public void setY(Double y) { this.y = y; }

        public Double getWidth() { return width; }
        public void setWidth(Double width) { this.width = width; }

        public Double getHeight() { return height; }
        public void setHeight(Double height) { this.height = height; }
    }
}
