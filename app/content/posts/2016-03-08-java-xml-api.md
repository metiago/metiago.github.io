---
title:  'Java XML API'
date: "2016-03-08"
draft: false

---

```java
package com.tiago.xml;

import org.w3c.dom.*;
import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import javax.xml.namespace.QName;
import javax.xml.parsers.*;
import javax.xml.stream.*;
import javax.xml.stream.events.Attribute;
import javax.xml.stream.events.EndElement;
import javax.xml.stream.events.StartElement;
import javax.xml.stream.events.XMLEvent;
import javax.xml.xpath.*;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class XmlApiExample {

    private final static String XML_FILE_CLIENT = "client.xml";
    private final static String XML_FILE_EMPLOYEE = "employee.xml";

    public static void main(String args[]) {

        // runSaxApi();
        // domXMLparser();
        // domXMLReader();
        // parseXML();
        // staxCreateXML();
        xpathReader();
    }

    private static void xpathReader() {

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        DocumentBuilder builder;
        Document doc = null;
        try {
            builder = factory.newDocumentBuilder();
            doc = builder.parse(XML_FILE_EMPLOYEE);

            XPathFactory xpathFactory = XPathFactory.newInstance();

            XPath xpath = xpathFactory.newXPath();

            String name = getEmployeeNameById(doc, xpath, 4);
            System.out.println("Employee Name with ID 4: " + name);

            List<String> names = getEmployeeNameWithAge(doc, xpath, 30);
            System.out.println("Employees with 'age>30' are:" + Arrays.toString(names.toArray()));

            List<String> femaleEmps = getFemaleEmployeesName(doc, xpath);
            System.out.println("Female Employees names are:" + Arrays.toString(femaleEmps.toArray()));

        } catch (ParserConfigurationException | SAXException | IOException e) {
            e.printStackTrace();
        }
    }

    private static List<String> getFemaleEmployeesName(Document doc, XPath xpath) {
        List<String> list = new ArrayList<>();
        try {
 
            XPathExpression expr = xpath.compile("/Employees/Employee[gender='Female']/name/text()");
            NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
            for (int i = 0; i < nodes.getLength(); i++) {
                list.add(nodes.item(i).getNodeValue());
            }

        } catch (XPathExpressionException e) {
            e.printStackTrace();
        }
        return list;
    }

    private static List<String> getEmployeeNameWithAge(Document doc, XPath xpath, int age) {
        List<String> list = new ArrayList<>();
        try {
            XPathExpression expr = xpath.compile("/Employees/Employee[age>" + age + "]/name/text()");
            NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
            for (int i = 0; i < nodes.getLength(); i++)
                list.add(nodes.item(i).getNodeValue());
        } catch (XPathExpressionException e) {
            e.printStackTrace();
        }
        return list;
    }


    private static String getEmployeeNameById(Document doc, XPath xpath, int id) {
        String name = null;
        try {
            XPathExpression expr = xpath.compile("/Employees/Employee[@id='" + id + "']/name/text()");
            name = (String) expr.evaluate(doc, XPathConstants.STRING);
        } catch (XPathExpressionException e) {
            e.printStackTrace();
        }

        return name;
    }

    private static void staxCreateXML() {

        try {
            StringWriter stringWriter = new StringWriter();

            XMLOutputFactory xMLOutputFactory = XMLOutputFactory.newInstance();
            XMLStreamWriter xMLStreamWriter = xMLOutputFactory.createXMLStreamWriter(stringWriter);

            xMLStreamWriter.writeStartDocument();
            xMLStreamWriter.writeStartElement("cars");

            xMLStreamWriter.writeStartElement("supercars");
            xMLStreamWriter.writeAttribute("company", "Ferrari");

            xMLStreamWriter.writeStartElement("carname");
            xMLStreamWriter.writeAttribute("type", "formula one");
            xMLStreamWriter.writeCharacters("Ferrari 101");
            xMLStreamWriter.writeEndElement();

            xMLStreamWriter.writeStartElement("carname");
            xMLStreamWriter.writeAttribute("type", "sports");
            xMLStreamWriter.writeCharacters("Ferrari 202");
            xMLStreamWriter.writeEndElement();

            xMLStreamWriter.writeEndElement();
            xMLStreamWriter.writeEndDocument();

            xMLStreamWriter.flush();
            xMLStreamWriter.close();

            String xmlString = stringWriter.getBuffer().toString();

            stringWriter.close();

            System.out.println(xmlString);

        } catch (XMLStreamException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void parseXML() {

        List<Employee> empList = new ArrayList<>();

        Employee emp = null;

        try {

            XMLInputFactory xmlInputFactory = XMLInputFactory.newInstance();

            XMLEventReader xmlEventReader = xmlInputFactory.createXMLEventReader(new FileInputStream(XML_FILE_EMPLOYEE));

            while (xmlEventReader.hasNext()) {

                XMLEvent xmlEvent = xmlEventReader.nextEvent();

                if (xmlEvent.isStartElement()) {

                    StartElement startElement = xmlEvent.asStartElement();

                    if (startElement.getName().getLocalPart().equals("Employee")) {

                        emp = new Employee();
                        // GET THE 'ID' ATTRIBUTE FROM EMPLOYEE ELEMENT
                        Attribute idAttr = startElement.getAttributeByName(new QName("id"));
                        if (idAttr != null) {
                            emp.setId(Integer.parseInt(idAttr.getValue()));
                        }
                    }
                    else if (startElement.getName().getLocalPart().equals("age")) {
                        xmlEvent = xmlEventReader.nextEvent();
                        emp.setAge(Integer.parseInt(xmlEvent.asCharacters().getData()));
                    } else if (startElement.getName().getLocalPart().equals("name")) {
                        xmlEvent = xmlEventReader.nextEvent();
                        emp.setName(xmlEvent.asCharacters().getData());
                    } else if (startElement.getName().getLocalPart().equals("gender")) {
                        xmlEvent = xmlEventReader.nextEvent();
                        emp.setGender(xmlEvent.asCharacters().getData());
                    } else if (startElement.getName().getLocalPart().equals("role")) {
                        xmlEvent = xmlEventReader.nextEvent();
                        emp.setRole(xmlEvent.asCharacters().getData());
                    }
                }

                if (xmlEvent.isEndElement()) {
                    EndElement endElement = xmlEvent.asEndElement();
                    if (endElement.getName().getLocalPart().equals("Employee")) {
                        empList.add(emp);
                    }
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        System.out.println(empList.size());
    }

    // DOM PARSER PARSES THE ENTIRE XML DOCUMENT AND LOADS IT INTO MEMORY
    // THEN MODELS IT IN A "TREE" STRUCTURE FOR EASY TRAVERSAL / MANIPULATION.
    private static void domXMLparser() {

        try {

            File fXmlFile = new File(XML_FILE_CLIENT);
            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
            Document doc = dBuilder.parse(fXmlFile);

            doc.getDocumentElement().normalize();

            System.out.println("Root element :" + doc.getDocumentElement().getNodeName());

            NodeList nList = doc.getElementsByTagName("staff");

            System.out.println("----------------------------");

            for (int temp = 0; temp < nList.getLength(); temp++) {

                Node nNode = nList.item(temp);

                System.out.println("\nCurrent Element :" + nNode.getNodeName());

                if (nNode.getNodeType() == Node.ELEMENT_NODE) {

                    Element eElement = (Element) nNode;

                    System.out.println("Staff id : " + eElement.getAttribute("id"));
                    System.out.println("First Name : " + eElement.getElementsByTagName("firstname").item(0).getTextContent());
                    System.out.println("Last Name : " + eElement.getElementsByTagName("lastname").item(0).getTextContent());
                    System.out.println("Nick Name : " + eElement.getElementsByTagName("nickname").item(0).getTextContent());
                    System.out.println("Salary : " + eElement.getElementsByTagName("salary").item(0).getTextContent());

                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void domXMLReader() {

        try {

            File file = new File(XML_FILE_CLIENT);

            DocumentBuilder dBuilder = DocumentBuilderFactory.newInstance()
                    .newDocumentBuilder();

            Document doc = dBuilder.parse(file);

            System.out.println("Root element :" + doc.getDocumentElement().getNodeName());

            if (doc.hasChildNodes()) {

                printNote(doc.getChildNodes());

            }

        } catch (Exception e) {
            System.out.println(e.getMessage());
        }

    }

    private static void printNote(NodeList nodeList) {

        for (int count = 0; count < nodeList.getLength(); count++) {

            Node tempNode = nodeList.item(count);

            // make sure it's element node.
            if (tempNode.getNodeType() == Node.ELEMENT_NODE) {

                // get node name and value
                System.out.println("\nNode Name =" + tempNode.getNodeName() + " [OPEN]");
                System.out.println("Node Value =" + tempNode.getTextContent());

                if (tempNode.hasAttributes()) {

                    // get attributes names and values
                    NamedNodeMap nodeMap = tempNode.getAttributes();

                    for (int i = 0; i < nodeMap.getLength(); i++) {

                        Node node = nodeMap.item(i);
                        System.out.println("attr name : " + node.getNodeName());
                        System.out.println("attr value : " + node.getNodeValue());

                    }

                }

                if (tempNode.hasChildNodes()) {

                    // loop again if has child nodes
                    printNote(tempNode.getChildNodes());

                }

                System.out.println("Node Name =" + tempNode.getNodeName() + " [CLOSE]");

            }

        }

    }

    // SAX PARSER IS FASTER AND USES LESS MEMORY THAN DOM PARSER.
    private static void runSaxApi() {

        try {

            SAXParserFactory factory = SAXParserFactory.newInstance();
            SAXParser saxParser = factory.newSAXParser();

            DefaultHandler handler = new DefaultHandler() {

                boolean bfname = false;
                boolean blname = false;
                boolean bnname = false;
                boolean bsalary = false;

                public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException {

                    System.out.println("Start Element :" + qName);

                    if (qName.equalsIgnoreCase("FIRSTNAME")) {
                        bfname = true;
                    }

                    if (qName.equalsIgnoreCase("LASTNAME")) {
                        blname = true;
                    }

                    if (qName.equalsIgnoreCase("NICKNAME")) {
                        bnname = true;
                    }

                    if (qName.equalsIgnoreCase("SALARY")) {
                        bsalary = true;
                    }

                }

                public void endElement(String uri, String localName, String qName) throws SAXException {

                    System.out.println("End Element :" + qName);

                }

                public void characters(char ch[], int start, int length) throws SAXException {

                    if (bfname) {
                        System.out.println("First Name : " + new String(ch, start, length));
                        bfname = false;
                    }

                    if (blname) {
                        System.out.println("Last Name : " + new String(ch, start, length));
                        blname = false;
                    }

                    if (bnname) {
                        System.out.println("Nick Name : " + new String(ch, start, length));
                        bnname = false;
                    }

                    if (bsalary) {
                        System.out.println("Salary : " + new String(ch, start, length));
                        bsalary = false;
                    }

                }

            };

            saxParser.parse(XML_FILE_CLIENT, handler);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

```


```java
package com.tiago.xml;

import java.io.File;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Random;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;

import com.tiago.random.RandomData;

public class CreateXMLFile {

    public static void main(String[] args) {

        try {

            Animals animals = new Animals();

            List<Animal> animalsList = new ArrayList<>();

            for (int i = 0; i < 100000; i++) {

                int id = RandomData.getIds();
                int age = RandomData.getAge();
                String scientificName = String.valueOf(RandomData.animalsNames().get(new Random().nextInt(RandomData.animalsNames().size())));
                String status = String.valueOf(RandomData.status().get(new Random().nextInt(RandomData.status().size())));
                String veterinarian = String.valueOf(RandomData.veterinarians().get(new Random().nextInt(RandomData.veterinarians().size())));
                Date created = new Date(RandomData.getRandomTimeBetweenTwoDates());

                animalsList.add(new Animal(id, scientificName, status, veterinarian, created, age));
            }

            animals.setAnimals(animalsList);

            File file = new File("/home/tiago/Desktop/animals.xml");
            JAXBContext jaxbContext = JAXBContext.newInstance(Animals.class);
            Marshaller jaxbMarshaller = jaxbContext.createMarshaller();

            // OUTPUT PRETTY PRINTED
            jaxbMarshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);

            jaxbMarshaller.marshal(animals, file);
            jaxbMarshaller.marshal(animals, System.out);

        } catch (JAXBException e) {
            e.printStackTrace();
        }
    }
}

```

```java

package com.tiago.model;

import java.io.Serializable;
import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class Animals implements Serializable{
	
	private static final long serialVersionUID = 1L;
	
	@XmlElement(name = "animal")
	private List<Animal> animals;

	public List<Animal> getAnimals() {
		return animals;
	}

	public void setAnimals(List<Animal> animals) {
		this.animals = animals;
	}
}

package com.tiago.model;

import java.io.Serializable;
import java.util.Date;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class Animal implements Serializable {

    private static final long serialVersionUID = 1L;

    @XmlElement
    private int id;
    @XmlElement
    private String scientificName;
    @XmlElement
    private String status;
    @XmlElement
    private String veterinarian;
    @XmlElement
    private Date created;
    @XmlElement
    private int age;

    public Animal() {
    }

    public Animal(int id, String scientificName, String status, String veterinarian, Date created, int age) {
        this.id = id;
        this.scientificName = scientificName;
        this.status = status;
        this.veterinarian = veterinarian;
        this.created = created;
        this.age = age;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getScientificName() {
        return scientificName;
    }

    public void setScientificName(String scientificName) {
        this.scientificName = scientificName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getVeterinarian() {
        return veterinarian;
    }

    public void setVeterinarian(String veterinarian) {
        this.veterinarian = veterinarian;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
}

package com.tiago.model;


public class Employee {
    private int id;
    private String name;
    private String gender;
    private int age;
    private String role;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    @Override
    public String toString() {
        return "Employee:: ID=" + this.id + " Name=" + this.name + " Age=" + this.age + " Gender=" + this.gender +
                " Role=" + this.role;
    }

}

```
