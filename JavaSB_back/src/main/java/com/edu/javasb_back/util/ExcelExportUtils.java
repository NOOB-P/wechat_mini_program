package com.edu.javasb_back.util;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

public final class ExcelExportUtils {

    private static final int MAX_COLUMN_WIDTH = 50 * 256;
    private static final MediaType EXCEL_MEDIA_TYPE = MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    private ExcelExportUtils() {
    }

    public static ResponseEntity<Resource> buildExcelResponse(
            String sheetName,
            String downloadName,
            List<String> headers,
            List<List<String>> rows
    ) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet(sheetName);
            CellStyle headerStyle = createHeaderStyle(workbook);
            int[] columnWidths = new int[headers.size()];

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.size(); i++) {
                String header = safeValue(headers.get(i));
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(header);
                cell.setCellStyle(headerStyle);
                columnWidths[i] = Math.max(columnWidths[i], calculateWidth(header));
            }

            for (int rowIndex = 0; rowIndex < rows.size(); rowIndex++) {
                Row dataRow = sheet.createRow(rowIndex + 1);
                List<String> rowValues = rows.get(rowIndex);
                for (int colIndex = 0; colIndex < headers.size(); colIndex++) {
                    String value = colIndex < rowValues.size() ? safeValue(rowValues.get(colIndex)) : "";
                    dataRow.createCell(colIndex).setCellValue(value);
                    columnWidths[colIndex] = Math.max(columnWidths[colIndex], calculateWidth(value));
                }
            }

            for (int i = 0; i < columnWidths.length; i++) {
                sheet.setColumnWidth(i, Math.min(columnWidths[i], MAX_COLUMN_WIDTH));
            }

            workbook.write(outputStream);
            String encodedName = URLEncoder.encode(downloadName, StandardCharsets.UTF_8).replace("+", "%20");

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedName)
                    .contentType(EXCEL_MEDIA_TYPE)
                    .body(new ByteArrayResource(outputStream.toByteArray()));
        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    private static CellStyle createHeaderStyle(XSSFWorkbook workbook) {
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        return headerStyle;
    }

    private static String safeValue(String value) {
        return value == null ? "" : value;
    }

    private static int calculateWidth(String value) {
        int width = 0;
        for (char current : safeValue(value).toCharArray()) {
            width += current > 255 ? 2 : 1;
        }
        return Math.max((width + 2) * 256, 8 * 256);
    }
}
