+++

title =  ' NIO File API'
date = 1500-04-15T19:18:41-03:00

draft = false

+++

This is an implementation to write and read flat files using NIO API. It was built aiming to facilitate file
manipulation when integrating legacy systems.

`MappedFile.java`

```java
package com.tiago.files;

public class MappedFile {

	private Integer position;

	private Integer size;

	private Object data;

	public MappedFile(Integer position, Integer size, Object data) {
		super();
		this.position = position;
		this.size = size;
		this.data = data;
	}

	public Integer getPosition() {
		return position;
	}

	public void setPosition(Integer position) {
		this.position = position;
	}

	public Integer getSize() {
		return size;
	}

	public void setSize(Integer size) {
		this.size = size;
	}

	public Object getData() {
		return data;
	}

	public void setData(Object data) {
		this.data = data;
	}

}
```

`ReadPositionalFile.java`

```java
package com.tiago.files;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map.Entry;
import java.util.concurrent.atomic.AtomicInteger;

public class ReadPositionalFile {

    private List<String> lines;

    public ReadPositionalFile(File file) throws Exception {
        this.lines = readTextFile(file);
    }

    public LinkedHashMap<Integer, List<String>> readTabularRangedFile(LinkedHashMap<Integer, Integer> range,
            Integer indexLine) throws Exception {

        final LinkedHashMap<Integer, List<String>> returnData = new LinkedHashMap<>();

        lines.stream().filter((String line) -> !"".equals(line)).filter((String index) -> lines.get(indexLine) == index)
                .forEach((line) -> {

                    List<String> returnLines = new ArrayList<>();

                    int lineNumber = indexLine;

                    range.forEach((k, v) -> {

                        if (line.length() >= k) {

                            String value = line.substring(k, v);
                            returnLines.add(value.trim());
                            returnData.put(lineNumber, returnLines);
                        }
                    });
                });

        return returnData;
    }

    public LinkedHashMap<Integer, List<String>> readTabularRangedFile(LinkedHashMap<Integer, Integer> range,
            Integer startLine, Integer finalLine) throws Exception {

        final LinkedHashMap<Integer, List<String>> returnData = new LinkedHashMap<>();

        AtomicInteger atomicInteger = new AtomicInteger(0);

        lines.stream().filter((String line) -> !"".equals(line)).forEach((line) -> {

            List<String> returnLines = new ArrayList<>();

            int lineNumber = atomicInteger.getAndIncrement();

            if (lineNumber >= startLine && lineNumber <= finalLine) {

                range.forEach((k, v) -> {

                    if (line.length() >= k) {

                        String value = line.substring(k, v);
                        returnLines.add(value.trim());
                        returnData.put(lineNumber, returnLines);
                    }
                });
            }
        });

        return returnData;
    }

    public LinkedHashMap<Integer, List<String>> readTabularRangedFile(LinkedHashMap<Integer, Integer> range) throws Exception {

        final LinkedHashMap<Integer, List<String>> returnData = new LinkedHashMap<>();

        AtomicInteger atomicInteger = new AtomicInteger(0);

        lines.stream().filter((String line) -> !"".equals(line)).forEach((line) -> {

            List<String> returnLines = new ArrayList<>();

            int lineNumber = atomicInteger.getAndIncrement();

            range.forEach((k, v) -> {

                if (line.length() >= k) {

                    String value = line.substring(k, v);
                    returnLines.add(value.trim());
                    returnData.put(lineNumber, returnLines);
                }
            });
        });

        return returnData;
    }

    public LinkedHashMap<Integer, List<String>> readTabularRangedFile(LinkedHashMap<Integer, Integer> range, Integer startLine, Integer finalLine, LinkedHashMap<Integer, List<String>> validations) throws Exception {

        final LinkedHashMap<Integer, List<String>> returnData = new LinkedHashMap<>();

        AtomicInteger atomicInteger = new AtomicInteger(0);
        AtomicInteger removedLine = new AtomicInteger(0);

        lines.stream().filter((String line) -> !"".equals(line)).forEach((line) -> {

            List<String> returnLines = new ArrayList<>();

            int lineNumber = atomicInteger.getAndIncrement();

            if (lineNumber >= startLine && lineNumber <= finalLine) {

                range.forEach((k, v) -> {

                    if (line.length() >= k) {

                        String value = line.substring(k, v);

                        if (removedLine.get() < lineNumber) {

                            returnLines.add(value.trim());
                            returnData.put(lineNumber, returnLines);
                        }

                        if (validations.containsKey(k)) {

                            if (validateFilterParams(validations, value)) {
                                returnData.remove(lineNumber);
                                removedLine.set(lineNumber);
                            }
                        }
                    }
                });
            }
        });

        return returnData;
    }

    private boolean validateFilterParams(LinkedHashMap<Integer, List<String>> filters, String value) {

        boolean hasValidation = false;

        for (Entry<Integer, List<String>> filter : filters.entrySet()) {

            for (String filterParam : filter.getValue()) {

                if (filterParam.equals(value)) {
                    hasValidation = true;
                    break;
                }
            }
        }

        return hasValidation;
    }

    public List<String> readTextFile(File file) throws Exception {

        if (getFileExtension(file).equals("txt")) {

            if (lines == null) {

                Path filePath = Paths.get(file.getAbsolutePath());

                lines = Files.readAllLines(filePath);

                if (lines.size() > 0) {
                    return lines;
                } else {
                    throw new Exception("The file has no data to be read.");
                }
            } else {
                return lines;
            }
        }

        throw new Exception("The file has not a txt extensions.");
    }

    public int numberOfLines() {
        return lines == null ? 0 : lines.size();
    }

    private static String getFileExtension(File file) {
        String fileName = file.getName();
        if (fileName.lastIndexOf(".") != -1 && fileName.lastIndexOf(".") != 0) {
            return fileName.substring(fileName.lastIndexOf(".") + 1);
        } else {
            return "";
        }
    }
}

```

`WriteMappedFile.java`

```java
package com.tiago.files;

import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class WriteMappedFile {
	
	private String filePath;
	
	public WriteMappedFile(String filePath) {
		this.filePath = filePath;
	}
	
	public void writeToFile(List<List<MappedFile>> writers)	throws Exception {

		RandomAccessFile stream = new RandomAccessFile(filePath, "rw");
		
		FileChannel channel = stream.getChannel();
			
		List<String> finalData = new ArrayList<>();
		
		for (int i = 0; i < writers.size(); i++) {
									
			for (MappedFile outputData : writers.get(i)) {
				
				Object valor = convertAndGetValue(outputData);
				
				channel.position(outputData.getPosition());
								
				String value = String.valueOf(valor);
				byte[] strBytes = value.getBytes();
				ByteBuffer buffer = ByteBuffer.allocate(strBytes.length);
				buffer.put(strBytes);
				buffer.flip();
				channel.write(buffer);
			}
			
			channel.position(0);
			String line = stream.readLine();
			finalData.add(line);			
			stream.setLength(0);
		}

		stream.close();
		channel.close();
		
		Files.write(Paths.get(filePath), finalData);		
	}
	
	private Object convertAndGetValue(MappedFile outputData) throws Exception {
		
		Object valor = outputData.getData() == null ? "" : outputData.getData();
				
		if (outputData.getData() instanceof String) {

			valor = (String) outputData.getData();

			if (outputData.getData().toString().length() >= valor.toString().length()) {

				valor = String.format("%1$-" + outputData.getSize() + "s", valor).replace(" ", " ");
			}
			
		}
		else if(outputData.getData() instanceof Date) {
			
			valor = Class.forName(valor.getClass().getTypeName()).cast(valor);

			if (outputData.getData().toString().length() >= valor.toString().length()) {

				valor = String.format("%1$-" + outputData.getSize() + "s", valor).replace(" ", " ");
			}
		}	
		else if(outputData.getData() instanceof Number) {
			
			valor = Class.forName(valor.getClass().getTypeName()).cast(valor);
			
			if (valor.toString().length() >= valor.toString().length()) {

				valor = String.format("%1$" + outputData.getSize() + "s", valor).replace(" ", "0");
			}
		}
		
		return valor;
	}	
}

```

`FilesTest.java`

```java

package com.tiago.files;

import java.io.File;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Random;

import com.tiago.random.RandomData;

public class FilesTest {

    private static final String FILE_TXT = "D:\\animals.txt";

    public static void main(String[] args) throws Exception {

        long lStartTime = new Date().getTime();

        // ++++++++++++++++++++++++++++++++++++++++++++++++
        exportFile();
        //importFile();

        // ++++++++++++++++++++++++++++++++++++++++++++++++
        long lEndTime = new Date().getTime();

        long difference = lEndTime - lStartTime;

        System.out.println("Elapsed milliseconds: " + difference);
    }

    public static LinkedHashMap<Integer, List<String>> importFile() throws Exception {

        ReadPositionalFile bmgLoteRecuperaUtils = new ReadPositionalFile(new File(FILE_TXT));

        // HEADER
        // LinkedHashMap<Integer, Integer> headerArquivo = new LinkedHashMap<>();
        // headerArquivo.put(0, 1); // 0. IDENTIFICADOR HEADER
        // headerArquivo.put(1, 4); // 1. CODIGO DO SISTEMA
        // headerArquivo.put(4, 18); // 2. DATA E HORA
        // LinkedHashMap<Integer, List<String>> resultHeader = bmgLoteRecuperaUtils.readTabularRangedFile(headerArquivo, 0, 0);
        // DETALHES
        LinkedHashMap<Integer, Integer> detalheArquivo = new LinkedHashMap<>();
        detalheArquivo.put(0, 1); // 0. IDENTIFICADOR DETALHE
        detalheArquivo.put(1, 5); // 1. AGENCIA
        detalheArquivo.put(4, 14); // 2. CONTA
        detalheArquivo.put(14, 22); // 3. DATA LANCAMENTO
        detalheArquivo.put(23, 35); // 4. DOCUMENTO
        detalheArquivo.put(35, 40); // 5. PARCELA
        detalheArquivo.put(40, 56); // 6. VALOR PARCELA
        detalheArquivo.put(56, 72); // 7. VALOR DEBITADO

        return bmgLoteRecuperaUtils.readTabularRangedFile(detalheArquivo, 1, bmgLoteRecuperaUtils.numberOfLines() - 2, mountValidationParams());

        // resultDetalhes.forEach((k, v) -> System.out.println(v));
        // TRAILER
        // LinkedHashMap<Integer, Integer> trailerArquivo = new LinkedHashMap<>();
        // trailerArquivo.put(0, 1); // 0. IDENTIFICADOR TRAILER
        // trailerArquivo.put(1, 7); // 1. QTD. LANCAMENTOS
        // LinkedHashMap<Integer, List<String>> resultTrailer = bmgLoteRecuperaUtils.readTabularRangedFile(trailerArquivo,	bmgLoteRecuperaUtils.numberOfLines() - 1);
    }

    private static LinkedHashMap<Integer, List<String>> mountValidationParams() {

        // EX. DADO APARTIR DA POS. 56 SE FOR IGUAL A 0, REMOVE A LINHA
        LinkedHashMap<Integer, List<String>> validations = new LinkedHashMap<>();
        validations.put(1, Arrays.asList("0001"));
        validations.put(23, Arrays.asList("000013145001"));

        return validations;
    }

    public static void exportFile() throws Exception {

        DateFormat format = new SimpleDateFormat("yyyyMMdd");

        WriteMappedFile outputmapper = new WriteMappedFile(FILE_TXT);

        File file = new File(FILE_TXT);

        if (file.exists()) {
            file.delete();
        }

        List<List<MappedFile>> writers = new ArrayList<>();

        List<MappedFile> dataList = new ArrayList<>();

        // HEADER
//        dataList.add(new MappedFile(0, 1, 1));
//        dataList.add(new MappedFile(1, 3, 11));
//        dataList.add(new MappedFile(5, 14, format.format(new Date())));
//        writers.add(dataList);
        for (int i = 0; i <= 10000; i++) {

            int id = RandomData.getIds();
            String scientificName = String.valueOf(RandomData.animalsNames().get(new Random().nextInt(RandomData.animalsNames().size())));
            String status = String.valueOf(RandomData.status().get(new Random().nextInt(RandomData.status().size())));
            String veterinarian = String.valueOf(RandomData.veterinarians().get(new Random().nextInt(RandomData.veterinarians().size())));
            Date created = new Date(RandomData.getRandomTimeBetweenTwoDates());

            dataList = new ArrayList<>();
            dataList.add(new MappedFile(0, 2, id));
            dataList.add(new MappedFile(5, 30, scientificName));
            dataList.add(new MappedFile(40, 10, status));
            dataList.add(new MappedFile(50, 50, veterinarian));
            dataList.add(new MappedFile(101, 8, format.format(created)));
            writers.add(dataList);
        }

        // FOOTER
//        dataList = new ArrayList<>();
//        dataList.add(new MappedFile(0, 1, 3));
//        dataList.add(new MappedFile(1, 6, 123));
//        writers.add(dataList);
        outputmapper.writeToFile(writers);
    }
}

```
