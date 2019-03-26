---
layout: default
title:  Unmarshal XML in Golang
date:   2018-03-12 20:18:00 +0100
category: Dev
---

## Unmarshal XML in Golang

Follow a simple example of how to unmarshal a XML structure using Golang.
First we have to create a XML file called data-example.xml, like below

```xml

<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<customerArchiveContent lang="de" vin="WBY8P610307D18056" requestDate="20-02-2019" unitOfLength="km">
    <telematicValueList dataCategory="VEHICLE_STATUS">
        <telematicValue>
            <name>AC-Ladespannung</name>
            <value>235</value>
            <unit>V</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>AC-Ladestrom</name>
            <value>32</value>
            <unit>A</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Ausrichtung des Fahrzeugs</name>
            <value>3</value>
            <unit>degrees</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Auswahl des günstigsten Ladefensters (Charging Window Selection)</name>
            <value>NOTCHOSEN</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Bewegungszustand des Fahrzeugs</name>
            <value>ASN_isFalse</value>
            <unit></unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 08:02:07</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Kilometerstand</name>
            <value>4189</value>
            <unit>km</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Kippstatus des Schiebedachs</name>
            <value>CLOSED</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Kopplung Mobiltelefon</name>
            <value>null</value>
            <unit></unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 08:02:07</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Lademethode und Steckertyp</name>
            <value>AC_TYPE2PLUG</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Ladeprofil</name>
            <value>&lt;wt&gt;
    &lt;chargingMode&gt;
        &lt;immediateCharging/&gt;
    &lt;/chargingMode&gt;
    &lt;chargingPreference&gt;
        &lt;chargingWindow/&gt;
    &lt;/chargingPreference&gt;
    &lt;departureTimes&gt;
        &lt;departureTime1Active&gt;
            &lt;activate/&gt;
        &lt;/departureTime1Active&gt;
        &lt;departureTime1&gt;
            &lt;hours&gt;6&lt;/hours&gt;
            &lt;minutes&gt;0&lt;/minutes&gt;
        &lt;/departureTime1&gt;
        &lt;weekdays1&gt;
            &lt;monday/&gt;
        &lt;/weekdays1&gt;
        &lt;departureTime2Active&gt;
            &lt;activate/&gt;
        &lt;/departureTime2Active&gt;
        &lt;departureTime2&gt;
            &lt;hours&gt;13&lt;/hours&gt;
            &lt;minutes&gt;0&lt;/minutes&gt;
        &lt;/departureTime2&gt;
        &lt;weekdays2&gt;
            &lt;friday/&gt;
        &lt;/weekdays2&gt;
        &lt;departureTime3Active&gt;
            &lt;deactivate/&gt;
        &lt;/departureTime3Active&gt;
        &lt;departureTime3&gt;
            &lt;hours&gt;8&lt;/hours&gt;
            &lt;minutes&gt;0&lt;/minutes&gt;
        &lt;/departureTime3&gt;
        &lt;departureTime4Active&gt;
            &lt;deactivate/&gt;
        &lt;/departureTime4Active&gt;
        &lt;departureTime4&gt;
            &lt;hours&gt;13&lt;/hours&gt;
            &lt;minutes&gt;0&lt;/minutes&gt;
        &lt;/departureTime4&gt;
        &lt;weekdays4&gt;
            &lt;friday/&gt;
        &lt;/weekdays4&gt;
    &lt;/departureTimes&gt;
    &lt;climatisationOn&gt;
        &lt;isFalse/&gt;
    &lt;/climatisationOn&gt;
    &lt;reductionOfChargeCurrent&gt;
        &lt;start&gt;
            &lt;hours&gt;9&lt;/hours&gt;
            &lt;minutes&gt;15&lt;/minutes&gt;
        &lt;/start&gt;
        &lt;end&gt;
            &lt;hours&gt;13&lt;/hours&gt;
            &lt;minutes&gt;0&lt;/minutes&gt;
        &lt;/end&gt;
    &lt;/reductionOfChargeCurrent&gt;
&lt;/wt&gt;</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Ladeprofil (Remote)</name>
            <value>INVALID;DIRECT_CHG_ONCE_NOT_ACTIVE</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Ladestatus</name>
            <value>CHARGINGACTIVE</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Ladestatus der Hochvoltbatterie</name>
            <value>28</value>
            <unit>%</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Niedervoltbatterie</name>
            <value>null</value>
            <unit></unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 08:02:07</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Position des Fahrzeugs über Normalhöhennull</name>
            <value>-NA-</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Position des Fahrzeugs – geographische Breite</name>
            <value>48.18942</value>
            <unit>WGS84</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Position des Fahrzeugs – geographische Länge</name>
            <value>11.568546</value>
            <unit>WGS84</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Position des Schiebedachs</name>
            <value>0</value>
            <unit>cm</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Reichweite des Tankinhalts</name>
            <value>0.0</value>
            <unit>km</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Remote Service Ergebnis</name>
            <value>true</value>
            <unit></unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 08:02:07</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Remote Service Typ</name>
            <value>REMOTE_CHARGING_PROFILE</value>
            <unit></unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 08:02:07</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Status der Ladesteckverbindung</name>
            <value>CONNECTED</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Status der Motorhaube</name>
            <value>CLOSED</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Status der Tür hinten links</name>
            <value>OPEN</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Status der Tür hinten rechts</name>
            <value>CLOSED</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Status der Tür vorn links</name>
            <value>CLOSED</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Status der Tür vorn rechts</name>
            <value>CLOSED</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Status der Türen</name>
            <value>SECURED</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Status des Fensters vorn links</name>
            <value>CLOSED</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Status des Fensters vorn rechts</name>
            <value>CLOSED</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Status des Kofferraum Deckel</name>
            <value>CLOSED</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Status des Schiebedachs</name>
            <value>CLOSED</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Tankinhalt</name>
            <value>0</value>
            <unit>l</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Zustand der Lichter</name>
            <value>ASN_isFalse</value>
            <unit></unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 08:02:07</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Zustand der Türen</name>
            <value>oldDoorStatus:ASN_secured,newDoorStatus:ASN_secured,allDoorsLocked:ASN_isFalse,trunkLocked:ASN_isTrue</value>
            <unit></unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 08:02:07</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Zustand der Zündung</name>
            <value>ASN_isFalse</value>
            <unit></unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 08:02:07</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Zustand des Motors (an/aus)</name>
            <value>ASN_isFalse</value>
            <unit></unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 08:02:07</valueTimestamp>
        </telematicValue>
    </telematicValueList>
    <telematicValueList dataCategory="USAGE_BASED">
        <cbsMessageList>
            <cbsMessage>
                <name>Bremsflüssigkeit</name>
                <description>Nächster Wechsel spätestens zum angegebenen Termin.</description>
                <status>OK</status>
                <date>01.12.2020 00:00</date>
                <unitOfLengthRemaining>null</unitOfLengthRemaining>
            </cbsMessage>
            <cbsMessage>
                <name>Fahrzeug-Check</name>
                <description>Nächste Sichtprüfung nach der angegebenen Fahrstrecke oder zum angegebenen Termin.</description>
                <status>OK</status>
                <date>01.12.2020 00:00</date>
                <unitOfLengthRemaining>null</unitOfLengthRemaining>
            </cbsMessage>
            <cbsMessage>
                <name>§ Fahrzeuguntersuchung</name>
                <description>Nächste gesetzliche Fahrzeuguntersuchung zum angegebenen Termin.</description>
                <status>OK</status>
                <date>01.12.2021 00:00</date>
                <unitOfLengthRemaining>null</unitOfLengthRemaining>
            </cbsMessage>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </cbsMessageList>
        <ccmMessageList>
            <valueTimestamp>21.02.2019 10:00:16</valueTimestamp>
        </ccmMessageList>
        <telematicValue>
            <name>Aktivierungsdauer ECO Modus der letzten Fahrt</name>
            <value>0</value>
            <unit>%</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 06:23:08</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Aktivierungsdauer ECO PLUS Modus der letzten Fahrt</name>
            <value>0</value>
            <unit>%</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 06:23:08</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Elektrisch gefahrener Streckenanteil der letzten Fahrt</name>
            <value>100</value>
            <unit>%</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 06:23:08</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Fahrstilbewertung 'Beschleunigungsverhalten'</name>
            <value>0</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 06:23:08</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Fahrstilbewertung 'Vorausschauendes Fahren'</name>
            <value>0</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 06:23:08</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Kilometerstand der letzten Fahrt</name>
            <value>4189</value>
            <unit>km</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 06:23:08</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Kraftstoffverbrauch der letzten Fahrt</name>
            <value>0.0</value>
            <unit>l</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 06:23:08</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Ladezustand der Batterie</name>
            <value>28</value>
            <unit>%</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 06:23:08</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Verbrauch elektrische Energie der letzten Fahrt</name>
            <value>3.39</value>
            <unit>kWh</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 06:23:08</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Verbrauch elektrische Energie im COMFORT Modus der letzten Fahrt</name>
            <value>0.79</value>
            <unit>kWh</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 06:23:08</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Zeitpunkt der letzten Fahrt</name>
            <value>21.02.2019 06:21:00 UTC</value>
            <unit>-</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 06:23:08</valueTimestamp>
        </telematicValue>
        <telematicValue>
            <name>Zurückgewonnene Energiemenge der letzten Fahrt</name>
            <value>3</value>
            <unit>kWh/100km</unit>
            <fetchTimestamp>21.02.2019 10:35:29</fetchTimestamp>
            <valueTimestamp>21.02.2019 06:23:08</valueTimestamp>
        </telematicValue>
    </telematicValueList>
    <telematicValueList dataCategory="EVENTS"/>
    <logoURL>https://bmwcardata.bmwgroup.com/images/logo.png</logoURL>
    <telematicCatalogName>BMWCarDataTelematikdatenKatalog.pdf</telematicCatalogName>
</customerArchiveContent>

```

In order to unmarshal our XML, we have to create a Golang structure for it. It's possible to create it manually
but there is a good tool that transform our XML to Golang struct, just access it here: (https://www.onlinetool.io/xmltogo/)

```go

package main

import (
	"encoding/xml"
	"fmt"
	"io/ioutil"
	"os"
)

// CustomerArchiveContent represents events emmited by cars
type CustomerArchiveContent struct {
	XMLName            xml.Name `xml:"customerArchiveContent"`
	Text               string   `xml:",chardata"`
	Lang               string   `xml:"lang,attr"`
	Vin                string   `xml:"vin,attr"`
	RequestDate        string   `xml:"requestDate,attr"`
	UnitOfLength       string   `xml:"unitOfLength,attr"`
	TelematicValueList []struct {
		Text           string `xml:",chardata"`
		DataCategory   string `xml:"dataCategory,attr"`
		TelematicValue []struct {
			Text           string `xml:",chardata"`
			Name           string `xml:"name"`
			Value          string `xml:"value"`
			Unit           string `xml:"unit"`
			FetchTimestamp string `xml:"fetchTimestamp"`
			ValueTimestamp string `xml:"valueTimestamp"`
		} `xml:"telematicValue"`
		CbsMessageList struct {
			Text       string `xml:",chardata"`
			CbsMessage []struct {
				Text                  string `xml:",chardata"`
				Name                  string `xml:"name"`
				Description           string `xml:"description"`
				Status                string `xml:"status"`
				Date                  string `xml:"date"`
				UnitOfLengthRemaining string `xml:"unitOfLengthRemaining"`
			} `xml:"cbsMessage"`
			ValueTimestamp string `xml:"valueTimestamp"`
		} `xml:"cbsMessageList"`
		CcmMessageList struct {
			Text           string `xml:",chardata"`
			ValueTimestamp string `xml:"valueTimestamp"`
		} `xml:"ccmMessageList"`
	} `xml:"telematicValueList"`
	LogoURL              string `xml:"logoURL"`
	TelematicCatalogName string `xml:"telematicCatalogName"`
}

func main() {

	var cac CustomerArchiveContent

	xmlFile, err := os.Open("data-example.xml")

	if err != nil {
		fmt.Println(err)
	}

	defer xmlFile.Close()

	byteValue, err := ioutil.ReadAll(xmlFile)

	if err != nil {
		fmt.Println(err)
	}

	xml.Unmarshal(byteValue, &cac)

	for _, tvl := range cac.TelematicValueList {

		for _, tv := range tvl.TelematicValue {

			fmt.Println("Name: " + tv.Name)
			fmt.Println("Value:", tv.Value)
			fmt.Println("Unit: " + tv.Unit)
			fmt.Println("Fetch: " + tv.FetchTimestamp)
			fmt.Println("Time: " + tv.ValueTimestamp)
		}
	}
}

```