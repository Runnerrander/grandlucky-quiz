// pages/index.js
import Head from "next/head";
import { useMemo, useState } from "react";

/**
 * Raw data pasted from you (unchanged).
 * We’ll derive Top 6, Next 20, and Others from this.
 */
const ALL_RAW = [{"idx":0,"id":208,"username":"GL-HABY","time_ms":72711,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-15 18:41:07.660822+00","time_seconds":"72.7110000000000000","minutes":1,"seconds":12,"millis":711,"time_mm_ss_ms":"01:12.711"},{"idx":1,"id":209,"username":"GL-QX3V","time_ms":12101,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-16 08:40:39.994169+00","time_seconds":"12.1010000000000000","minutes":0,"seconds":12,"millis":101,"time_mm_ss_ms":"00:12.101"},{"idx":2,"id":210,"username":"GL-WO9I","time_ms":10639,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-16 08:57:31.258273+00","time_seconds":"10.6390000000000000","minutes":0,"seconds":10,"millis":639,"time_mm_ss_ms":"00:10.639"},{"idx":3,"id":211,"username":"GL-FB5U","time_ms":5756,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-16 09:02:02.040172+00","time_seconds":"5.7560000000000000","minutes":0,"seconds":5,"millis":756,"time_mm_ss_ms":"00:05.756"},{"idx":4,"id":212,"username":"GL-UJQA","time_ms":5362,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-16 11:59:55.612763+00","time_seconds":"5.3620000000000000","minutes":0,"seconds":5,"millis":362,"time_mm_ss_ms":"00:05.362"},{"idx":5,"id":213,"username":"GL-IGMV","time_ms":51550,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-16 18:35:01.625011+00","time_seconds":"51.5500000000000000","minutes":0,"seconds":51,"millis":550,"time_mm_ss_ms":"00:51.550"},{"idx":6,"id":214,"username":"GL-UGER","time_ms":52418,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-16 18:36:57.184266+00","time_seconds":"52.4180000000000000","minutes":0,"seconds":52,"millis":418,"time_mm_ss_ms":"00:52.418"},{"idx":7,"id":215,"username":"GL-6AKS","time_ms":55475,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-16 19:13:17.572093+00","time_seconds":"55.4750000000000000","minutes":0,"seconds":55,"millis":475,"time_mm_ss_ms":"00:55.475"},{"idx":8,"id":216,"username":"GL-JUNA","time_ms":8391,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-16 19:58:16.562474+00","time_seconds":"8.3910000000000000","minutes":0,"seconds":8,"millis":391,"time_mm_ss_ms":"00:08.391"},{"idx":9,"id":217,"username":"GL-9PVN","time_ms":110606,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-16 21:33:06.946609+00","time_seconds":"110.6060000000000000","minutes":1,"seconds":50,"millis":606,"time_mm_ss_ms":"01:50.606"},{"idx":10,"id":218,"username":"GL-ZLQP","time_ms":134875,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-17 06:28:00.8265+00","time_seconds":"134.8750000000000000","minutes":2,"seconds":14,"millis":875,"time_mm_ss_ms":"02:14.875"},{"idx":11,"id":219,"username":"GL-CQTA","time_ms":42039,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-17 07:35:30.62182+00","time_seconds":"42.0390000000000000","minutes":0,"seconds":42,"millis":39,"time_mm_ss_ms":"00:42.039"},{"idx":12,"id":220,"username":"GL-HUVF","time_ms":38977,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-17 07:40:47.423848+00","time_seconds":"38.9770000000000000","minutes":0,"seconds":38,"millis":977,"time_mm_ss_ms":"00:38.977"},{"idx":13,"id":221,"username":"GL-D3S5","time_ms":103216,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-17 08:11:04.978807+00","time_seconds":"103.2160000000000000","minutes":1,"seconds":43,"millis":216,"time_mm_ss_ms":"01:43.216"},{"idx":14,"id":222,"username":"GL-XZJE","time_ms":70376,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-17 15:10:52.749494+00","time_seconds":"70.3760000000000000","minutes":1,"seconds":10,"millis":376,"time_mm_ss_ms":"01:10.376"},{"idx":15,"id":223,"username":"GL-F5VI","time_ms":45568,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-17 18:23:23.11335+00","time_seconds":"45.5680000000000000","minutes":0,"seconds":45,"millis":568,"time_mm_ss_ms":"00:45.568"},{"idx":16,"id":224,"username":"GL-GOIS","time_ms":359008,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-19 15:35:57.739916+00","time_seconds":"359.0080000000000000","minutes":5,"seconds":59,"millis":8,"time_mm_ss_ms":"05:59.008"},{"idx":17,"id":225,"username":"GL-LYMP","time_ms":132258,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-19 16:22:36.74771+00","time_seconds":"132.2580000000000000","minutes":2,"seconds":12,"millis":258,"time_mm_ss_ms":"02:12.258"},{"idx":18,"id":226,"username":"GL-6L9E","time_ms":36177,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-19 16:26:31.434564+00","time_seconds":"36.1770000000000000","minutes":0,"seconds":36,"millis":177,"time_mm_ss_ms":"00:36.177"},{"idx":19,"id":227,"username":"GL-HOCK","time_ms":44670,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-20 13:02:41.487335+00","time_seconds":"44.6700000000000000","minutes":0,"seconds":44,"millis":670,"time_mm_ss_ms":"00:44.670"},{"idx":20,"id":228,"username":"GL-DIMW","time_ms":55006,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-20 17:15:54.043015+00","time_seconds":"55.0060000000000000","minutes":0,"seconds":55,"millis":6,"time_mm_ss_ms":"00:55.006"},{"idx":21,"id":229,"username":"GL-WSXW","time_ms":52147,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-20 19:09:04.594919+00","time_seconds":"52.1470000000000000","minutes":0,"seconds":52,"millis":147,"time_mm_ss_ms":"00:52.147"},{"idx":22,"id":230,"username":"GL-ONCU","time_ms":37114,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-21 11:46:14.497986+00","time_seconds":"37.1140000000000000","minutes":0,"seconds":37,"millis":114,"time_mm_ss_ms":"00:37.114"},{"idx":23,"id":231,"username":"GL-T1TU","time_ms":35231,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-21 12:11:54.915877+00","time_seconds":"35.2310000000000000","minutes":0,"seconds":35,"millis":231,"time_mm_ss_ms":"00:35.231"},{"idx":24,"id":232,"username":"GL-GAZT","time_ms":39230,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-21 12:15:01.31763+00","time_seconds":"39.2300000000000000","minutes":0,"seconds":39,"millis":230,"time_mm_ss_ms":"00:39.230"},{"idx":25,"id":233,"username":"GL-0KYS","time_ms":61551,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-21 13:35:11.41432+00","time_seconds":"61.5510000000000000","minutes":1,"seconds":1,"millis":551,"time_mm_ss_ms":"01:01.551"},{"idx":26,"id":234,"username":"qa.091","time_ms":212204,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-21 13:37:06.404578+00","time_seconds":"212.2040000000000000","minutes":3,"seconds":32,"millis":204,"time_mm_ss_ms":"03:32.204"},{"idx":27,"id":235,"username":"GL-E9XM","time_ms":117403,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-21 17:39:27.514027+00","time_seconds":"117.4030000000000000","minutes":1,"seconds":57,"millis":403,"time_mm_ss_ms":"01:57.403"},{"idx":28,"id":236,"username":"GL-YGY9","time_ms":28252,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-22 12:56:59.50365+00","time_seconds":"28.2520000000000000","minutes":0,"seconds":28,"millis":252,"time_mm_ss_ms":"00:28.252"},{"idx":29,"id":237,"username":"GL-THCM","time_ms":51204,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-23 15:48:21.524451+00","time_seconds":"51.2040000000000000","minutes":0,"seconds":51,"millis":204,"time_mm_ss_ms":"00:51.204"},{"idx":30,"id":238,"username":"GL-ANN7","time_ms":26788,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-23 16:02:24.786199+00","time_seconds":"26.7880000000000000","minutes":0,"seconds":26,"millis":788,"time_mm_ss_ms":"00:26.788"},{"idx":31,"id":239,"username":"GL-Q6QJ","time_ms":39619,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-23 22:47:01.899835+00","time_seconds":"39.6190000000000000","minutes":0,"seconds":39,"millis":619,"time_mm_ss_ms":"00:39.619"},{"idx":32,"id":240,"username":"GL-2RPL","time_ms":73680,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-24 04:29:19.801624+00","time_seconds":"73.6800000000000000","minutes":1,"seconds":13,"millis":680,"time_mm_ss_ms":"01:13.680"},{"idx":33,"id":241,"username":"GL-GCAH","time_ms":76961,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-24 14:38:19.005421+00","time_seconds":"76.9610000000000000","minutes":1,"seconds":16,"millis":961,"time_mm_ss_ms":"01:16.961"},{"idx":34,"id":242,"username":"GL-OVEN","time_ms":22459,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-25 14:08:23.716177+00","time_seconds":"22.4590000000000000","minutes":0,"seconds":22,"millis":459,"time_mm_ss_ms":"00:22.459"},{"idx":35,"id":243,"username":"GL-E8YO","time_ms":247502,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-26 14:59:06.817354+00","time_seconds":"247.5020000000000000","minutes":4,"seconds":7,"millis":502,"time_mm_ss_ms":"04:07.502"},{"idx":36,"id":244,"username":"GL-IFNC","time_ms":28143,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-27 14:55:54.363023+00","time_seconds":"28.1430000000000000","minutes":0,"seconds":28,"millis":143,"time_mm_ss_ms":"00:28.143"},{"idx":37,"id":245,"username":"GL-PBQM","time_ms":189435,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-27 19:26:01.198917+00","time_seconds":"189.4350000000000000","minutes":3,"seconds":9,"millis":435,"time_mm_ss_ms":"03:09.435"},{"idx":38,"id":246,"username":"GL-ZNAM","time_ms":70323,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-27 21:19:13.752488+00","time_seconds":"70.3230000000000000","minutes":1,"seconds":10,"millis":323,"time_mm_ss_ms":"01:10.323"},{"idx":39,"id":247,"username":"GL-YWZP","time_ms":233971,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-27 21:37:08.066802+00","time_seconds":"233.9710000000000000","minutes":3,"seconds":53,"millis":971,"time_mm_ss_ms":"03:53.971"},{"idx":40,"id":248,"username":"GL-ERPN","time_ms":55603,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-27 21:49:30.748175+00","time_seconds":"55.6030000000000000","minutes":0,"seconds":55,"millis":603,"time_mm_ss_ms":"00:55.603"},{"idx":41,"id":249,"username":"GL-JJRR","time_ms":32996,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 05:55:23.628059+00","time_seconds":"32.9960000000000000","minutes":0,"seconds":32,"millis":996,"time_mm_ss_ms":"00:32.996"},{"idx":42,"id":250,"username":"GL-OH1J","time_ms":55092,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 06:13:39.82958+00","time_seconds":"55.0920000000000000","minutes":0,"seconds":55,"millis":92,"time_mm_ss_ms":"00:55.092"},{"idx":43,"id":251,"username":"GL-LFJT","time_ms":61245,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 11:00:29.050369+00","time_seconds":"61.2450000000000000","minutes":1,"seconds":1,"millis":245,"time_mm_ss_ms":"01:01.245"},{"idx":44,"id":252,"username":"GL-VH35","time_ms":449747,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 13:14:39.48733+00","time_seconds":"449.7470000000000000","minutes":7,"seconds":29,"millis":747,"time_mm_ss_ms":"07:29.747"},{"idx":45,"id":253,"username":"GL-DFWD","time_ms":78498,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 14:39:43.274581+00","time_seconds":"78.4980000000000000","minutes":1,"seconds":18,"millis":498,"time_mm_ss_ms":"01:18.498"},{"idx":46,"id":254,"username":"GL-MDE7","time_ms":74846,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 14:50:16.238203+00","time_seconds":"74.8460000000000000","minutes":1,"seconds":14,"millis":846,"time_mm_ss_ms":"01:14.846"},{"idx":47,"id":255,"username":"GL-HCNP","time_ms":106663,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 15:18:39.107121+00","time_seconds":"106.6630000000000000","minutes":1,"seconds":46,"millis":663,"time_mm_ss_ms":"01:46.663"},{"idx":48,"id":256,"username":"GL-ZRXW","time_ms":74234,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 15:25:57.538322+00","time_seconds":"74.2340000000000000","minutes":1,"seconds":14,"millis":234,"time_mm_ss_ms":"01:14.234"},{"idx":49,"id":257,"username":"GL-ZYLH","time_ms":43675,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 16:34:28.415786+00","time_seconds":"43.6750000000000000","minutes":0,"seconds":43,"millis":675,"time_mm_ss_ms":"00:43.675"},{"idx":50,"id":258,"username":"GL-P9BX","time_ms":51464,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 16:57:53.590754+00","time_seconds":"51.4640000000000000","minutes":0,"seconds":51,"millis":464,"time_mm_ss_ms":"00:51.464"},{"idx":51,"id":259,"username":"GL-6QRH","time_ms":290891,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 17:20:54.051467+00","time_seconds":"290.8910000000000000","minutes":4,"seconds":50,"millis":891,"time_mm_ss_ms":"04:50.891"},{"idx":52,"id":260,"username":"GL-L7MH","time_ms":71118,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 17:44:27.68522+00","time_seconds":"71.1180000000000000","minutes":1,"seconds":11,"millis":118,"time_mm_ss_ms":"01:11.118"},{"idx":53,"id":261,"username":"GL-GUHH","time_ms":176442,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 17:52:54.767358+00","time_seconds":"176.4420000000000000","minutes":2,"seconds":56,"millis":442,"time_mm_ss_ms":"02:56.442"},{"idx":54,"id":262,"username":"GL-ZBUX","time_ms":86818,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 18:01:22.656058+00","time_seconds":"86.8180000000000000","minutes":1,"seconds":26,"millis":818,"time_mm_ss_ms":"01:26.818"},{"idx":55,"id":263,"username":"GL-Y7QF","time_ms":34591,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 18:02:35.585628+00","time_seconds":"34.5910000000000000","minutes":0,"seconds":34,"millis":591,"time_mm_ss_ms":"00:34.591"},{"idx":56,"id":264,"username":"GL-NCAD","time_ms":25069,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 18:32:25.563649+00","time_seconds":"25.0690000000000000","minutes":0,"seconds":25,"millis":69,"time_mm_ss_ms":"00:25.069"},{"idx":57,"id":265,"username":"GL-KHBZ","time_ms":151678,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 18:40:28.078954+00","time_seconds":"151.6780000000000000","minutes":2,"seconds":31,"millis":678,"time_mm_ss_ms":"02:31.678"},{"idx":58,"id":266,"username":"GL-AMFT","time_ms":128346,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 19:26:50.595236+00","time_seconds":"128.3460000000000000","minutes":2,"seconds":8,"millis":346,"time_mm_ss_ms":"02:08.346"},{"idx":59,"id":267,"username":"GL-KEQD","time_ms":75804,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 19:37:54.790752+00","time_seconds":"75.8040000000000000","minutes":1,"seconds":15,"millis":804,"time_mm_ss_ms":"01:15.804"},{"idx":60,"id":268,"username":"GL-G7MM","time_ms":90914,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 19:56:17.743309+00","time_seconds":"90.9140000000000000","minutes":1,"seconds":30,"millis":914,"time_mm_ss_ms":"01:30.914"},{"idx":61,"id":269,"username":"GL-PWIQ","time_ms":40077,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 19:57:22.433612+00","time_seconds":"40.0770000000000000","minutes":0,"seconds":40,"millis":77,"time_mm_ss_ms":"00:40.077"},{"idx":62,"id":270,"username":"GL-KW6A","time_ms":51331,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 20:22:50.250451+00","time_seconds":"51.3310000000000000","minutes":0,"seconds":51,"millis":331,"time_mm_ss_ms":"00:51.331"},{"idx":63,"id":271,"username":"GL-ESAX","time_ms":138995,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 20:59:46.537457+00","time_seconds":"138.9950000000000000","minutes":2,"seconds":18,"millis":995,"time_mm_ss_ms":"02:18.995"},{"idx":64,"id":272,"username":"GL-12I0","time_ms":149860,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 21:15:54.650686+00","time_seconds":"149.8600000000000000","minutes":2,"seconds":29,"millis":860,"time_mm_ss_ms":"02:29.860"},{"idx":65,"id":273,"username":"GL-ORSO","time_ms":126653,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 21:20:28.611281+00","time_seconds":"126.6530000000000000","minutes":2,"seconds":6,"millis":653,"time_mm_ss_ms":"02:06.653"},{"idx":66,"id":274,"username":"GL-OTRG","time_ms":35952,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 21:22:36.418934+00","time_seconds":"35.9520000000000000","minutes":0,"seconds":35,"millis":952,"time_mm_ss_ms":"00:35.952"},{"idx":67,"id":275,"username":"GL-PBGA","time_ms":53136,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 21:48:38.195452+00","time_seconds":"53.1360000000000000","minutes":0,"seconds":53,"millis":136,"time_mm_ss_ms":"00:53.136"},{"idx":68,"id":276,"username":"GL-6VI8","time_ms":71686,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-28 22:12:16.952784+00","time_seconds":"71.6860000000000000","minutes":1,"seconds":11,"millis":686,"time_mm_ss_ms":"01:11.686"},{"idx":69,"id":277,"username":"GL-OA7O","time_ms":76787,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-29 02:25:22.402779+00","time_seconds":"76.7870000000000000","minutes":1,"seconds":16,"millis":787,"time_mm_ss_ms":"01:16.787"},{"idx":70,"id":278,"username":"GL-R8SP","time_ms":80811,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-29 05:25:26.038686+00","time_seconds":"80.8110000000000000","minutes":1,"seconds":20,"millis":811,"time_mm_ss_ms":"01:20.811"},{"idx":71,"id":279,"username":"GL-MEKJ","time_ms":43838,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-29 07:16:12.583499+00","time_seconds":"43.8380000000000000","minutes":0,"seconds":43,"millis":838,"time_mm_ss_ms":"00:43.838"},{"idx":72,"id":280,"username":"GL-UAKO","time_ms":33708,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-29 07:38:56.711101+00","time_seconds":"33.7080000000000000","minutes":0,"seconds":33,"millis":708,"time_mm_ss_ms":"00:33.708"},{"idx":73,"id":281,"username":"GL-JCWO","time_ms":22597,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-09-29 18:49:32.527214+00","time_seconds":"22.5970000000000000","minutes":0,"seconds":22,"millis":597,"time_mm_ss_ms":"00:22.597"},{"idx":74,"id":301,"username":"GL-D2QR","time_ms":0,"correct":0,"round_id":null,"created_at":"2025-10-01 16:30:31.576396+00","time_seconds":"0.00000000000000000000","minutes":0,"seconds":0,"millis":0,"time_mm_ss_ms":"00:00.000"},{"idx":75,"id":303,"username":"GL-D3UT","time_ms":0,"correct":0,"round_id":null,"created_at":"2025-10-01 16:43:41.89809+00","time_seconds":"0.00000000000000000000","minutes":0,"seconds":0,"millis":0,"time_mm_ss_ms":"00:00.000"},{"idx":76,"id":304,"username":"GL-E2A9","time_ms":0,"correct":0,"round_id":null,"created_at":"2025-10-01 16:48:33.658818+00","time_seconds":"0.00000000000000000000","minutes":0,"seconds":0,"millis":0,"time_mm_ss_ms":"00:00.000"},{"idx":77,"id":305,"username":"GL-CKHZ","time_ms":0,"correct":0,"round_id":null,"created_at":"2025-10-01 17:29:20.520995+00","time_seconds":"0.00000000000000000000","minutes":0,"seconds":0,"millis":0,"time_mm_ss_ms":"00:00.000"},{"idx":78,"id":306,"username":"GL-YTQJ","time_ms":0,"correct":0,"round_id":null,"created_at":"2025-10-01 17:46:29.309908+00","time_seconds":"0.00000000000000000000","minutes":0,"seconds":0,"millis":0,"time_mm_ss_ms":"00:00.000"},{"idx":79,"id":307,"username":"GL-BBAW","time_ms":0,"correct":0,"round_id":null,"created_at":"2025-10-01 18:07:04.672494+00","time_seconds":"0.00000000000000000000","minutes":0,"seconds":0,"millis":0,"time_mm_ss_ms":"00:00.000"},{"idx":80,"id":308,"username":"GL-5V3F","time_ms":0,"correct":0,"round_id":null,"created_at":"2025-10-01 18:17:37.423499+00","time_seconds":"0.00000000000000000000","minutes":0,"seconds":0,"millis":0,"time_mm_ss_ms":"00:00.000"},{"idx":81,"id":310,"username":"GL-SX4P","time_ms":0,"correct":0,"round_id":null,"created_at":"2025-10-01 18:20:37.988082+00","time_seconds":"0.00000000000000000000","minutes":0,"seconds":0,"millis":0,"time_mm_ss_ms":"00:00.000"},{"idx":82,"id":312,"username":"GL-SEDL","time_ms":0,"correct":0,"round_id":null,"created_at":"2025-10-01 18:33:09.059396+00","time_seconds":"0.00000000000000000000","minutes":0,"seconds":0,"millis":0,"time_mm_ss_ms":"00:00.000"},{"idx":83,"id":314,"username":"GL-2FTN","time_ms":0,"correct":0,"round_id":null,"created_at":"2025-10-01 18:39:01.961251+00","time_seconds":"0.00000000000000000000","minutes":0,"seconds":0,"millis":0,"time_mm_ss_ms":"00:00.000"},{"idx":84,"id":316,"username":"GL-ERZD","time_ms":33708,"correct":5,"round_id":null,"created_at":"2025-10-01 18:47:48.562657+00","time_seconds":"33.7080000000000000","minutes":0,"seconds":33,"millis":708,"time_mm_ss_ms":"00:33.708"},{"idx":85,"id":317,"username":"GL-EM7G","time_ms":0,"correct":0,"round_id":null,"created_at":"2025-10-01 18:54:32.285669+00","time_seconds":"0.00000000000000000000","minutes":0,"seconds":0,"millis":0,"time_mm_ss_ms":"00:00.000"},{"idx":86,"id":319,"username":"GL-G6B7","time_ms":0,"correct":0,"round_id":null,"created_at":"2025-10-01 19:15:03.390917+00","time_seconds":"0.00000000000000000000","minutes":0,"seconds":0,"millis":0,"time_mm_ss_ms":"00:00.000"},{"idx":87,"id":322,"username":"GL-TEST","time_ms":34968,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-10-01 19:27:02.125858+00","time_seconds":"34.9680000000000000","minutes":0,"seconds":34,"millis":968,"time_mm_ss_ms":"00:34.968"},{"idx":88,"id":324,"username":"GL-55TH","time_ms":0,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-10-01 19:38:23.78932+00","time_seconds":"0.00000000000000000000","minutes":0,"seconds":0,"millis":0,"time_mm_ss_ms":"00:00.000"},{"idx":89,"id":332,"username":"GL-6X2U","time_ms":26767,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-10-01 19:57:31.563071+00","time_seconds":"26.7670000000000000","minutes":0,"seconds":26,"millis":767,"time_mm_ss_ms":"00:26.767"},{"idx":90,"id":334,"username":"GL-JSA9","time_ms":125788,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-10-01 21:27:01.726036+00","time_seconds":"125.7880000000000000","minutes":2,"seconds":5,"millis":788,"time_mm_ss_ms":"02:05.788"},{"idx":91,"id":336,"username":"GL-LXDL","time_ms":70120,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-10-02 20:47:10.561777+00","time_seconds":"70.1200000000000000","minutes":1,"seconds":10,"millis":120,"time_mm_ss_ms":"01:10.120"},{"idx":92,"id":338,"username":"GL-MQUG","time_ms":64414,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-10-02 21:01:29.256081+00","time_seconds":"64.4140000000000000","minutes":1,"seconds":4,"millis":414,"time_mm_ss_ms":"01:04.414"},{"idx":93,"id":340,"username":"GL-PSKY","time_ms":29851,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-10-02 21:19:50.243506+00","time_seconds":"29.8510000000000000","minutes":0,"seconds":29,"millis":851,"time_mm_ss_ms":"00:29.851"},{"idx":94,"id":342,"username":"GL-KKHC","time_ms":30735,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-10-03 09:50:13.379453+00","time_seconds":"30.7350000000000000","minutes":0,"seconds":30,"millis":735,"time_mm_ss_ms":"00:30.735"},{"idx":95,"id":344,"username":"GL-KNPL","time_ms":93432,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-10-04 08:50:22.913984+00","time_seconds":"93.4320000000000000","minutes":1,"seconds":33,"millis":432,"time_mm_ss_ms":"01:33.432"},{"idx":96,"id":346,"username":"GL-6M3B","time_ms":0,"correct":0,"round_id":null,"created_at":"2025-10-05 00:40:16.670136+00","time_seconds":"0.00000000000000000000","minutes":0,"seconds":0,"millis":0,"time_mm_ss_ms":"00:00.000"},{"idx":97,"id":347,"username":"GL-LT9B","time_ms":225765,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-10-06 11:35:39.92158+00","time_seconds":"225.7650000000000000","minutes":3,"seconds":45,"millis":765,"time_mm_ss_ms":"03:45.765"},{"idx":98,"id":349,"username":"GL-MKEK","time_ms":0,"correct":0,"round_id":null,"created_at":"2025-10-06 13:53:47.523898+00","time_seconds":"0.00000000000000000000","minutes":0,"seconds":0,"millis":0,"time_mm_ss_ms":"00:00.000"},{"idx":99,"id":350,"username":"GL-5XWQ","time_ms":105621,"correct":5,"round_id":"fe355b76-da86-4fb9-9a90-cb1a2b6e898e","created_at":"2025-10-06 16:21:48.886532+00","time_seconds":"105.6210000000000000","minutes":1,"seconds":45,"millis":621,"time_mm_ss_ms":"01:45.621"}];

/** Utilities */
const toMs = (n) => (typeof n === "number" ? n : Number(n || 0));
const normalize = (s) =>
  (s || "")
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/–|—/g, "-");

/** Build clean list of completed results (correct=5 and time_ms>0) */
const ALL_FINISHED = ALL_RAW
  .filter((r) => r && r.correct === 5 && toMs(r.time_ms) > 0)
  .map((r) => ({
    username: r.username,
    ms: toMs(r.time_ms),
    time: r.time_mm_ss_ms || msToPretty(toMs(r.time_ms)),
  }));

/** Fallback pretty time if needed */
function msToPretty(ms) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const ms3 = String(ms % 1000).padStart(3, "0");
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${ms3}`;
}

/** Sort asc, then slice Top 6 & Next 20, others = rest */
const SORTED = [...ALL_FINISHED].sort((a, b) => a.ms - b.ms);
const TOP6 = SORTED.slice(0, 6);
const NEXT20 = SORTED.slice(6, 26);
const OTHERS = SORTED.slice(26);

/** i18n */
const COPY = {
  en: {
    title: "The Vivko contest Round 1 has ended.",
    subtitle: "New contest coming soon.",
    banner:
      "The Vivko contest Round 1 has ended. A new contest is coming soon.",
    questions: "Questions? Email us at",
    searchLabel: "Find your result",
    searchPlaceholder: "Type username (e.g., GL-XX)",
    noMatch: "No matches.",
    top6: "Contestants for 2nd round (Top 6)",
    next20: "Back up contestants for 2nd round (Next 20)",
    others: "All other finishers",
    username: "Username",
    quizTime: "Quiz Time",
    group: "Group",
    gTop6: "Top 6",
    gBackup: "Backup",
    gOthers: "Completed",
  },
  hu: {
    title: "A Vivkó nyereményjáték 1. fordulója lezárult.",
    subtitle: "Hamarosan új játék indul.",
    banner:
      "A Vivkó nyereményjáték első fordulója lezárult. Hamarosan új játék indul.",
    questions: "Kérdés esetén írj nekünk:",
    searchLabel: "Keresd meg az eredményed",
    searchPlaceholder: "Írd be a felhasználónevet (pl. GL-XX)",
    noMatch: "Nincs találat.",
    top6: "2. forduló versenyzői (Top 6)",
    next20: "Tartalék versenyzők (Következő 20)",
    others: "Többi befejezett",
    username: "Felhasználónév",
    quizTime: "Kvízidő",
    group: "Csoport",
    gTop6: "Top 6",
    gBackup: "Tartalék",
    gOthers: "Teljesített",
  },
};

export default function ResultsPage() {
  const [lang, setLang] = useState("en");
  const [query, setQuery] = useState("");
  const t = COPY[lang];

  const haystack = useMemo(() => {
    // decorate with group
    const withGroup = [
      ...TOP6.map((r) => ({ ...r, group: "top6" })),
      ...NEXT20.map((r) => ({ ...r, group: "backup" })),
      ...OTHERS.map((r) => ({ ...r, group: "others" })),
    ];
    return withGroup;
  }, []);

  const found = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return haystack.filter((r) => normalize(r.username) === q);
  }, [query, haystack]);

  const groupLabel = (g) =>
    g === "top6" ? t.gTop6 : g === "backup" ? t.gBackup : t.gOthers;

  return (
    <>
      <Head>
        <title>GrandLucky Travel — Results</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="page">
        <header className="hero">
          <h1 className="title">{t.title}</h1>
          <p className="sub">{t.subtitle}</p>

          <div className="lang">
            <button
              aria-pressed={lang === "hu"}
              className={lang === "hu" ? "on" : ""}
              onClick={() => setLang("hu")}
            >
              HU
            </button>
            <button
              aria-pressed={lang === "en"}
              className={lang === "en" ? "on" : ""}
              onClick={() => setLang("en")}
            >
              EN
            </button>
          </div>
        </header>

        <section className="banner">
          <span>{t.banner} </span>
          <span>
            {t.questions}{" "}
            <a href="mailto:support@grandluckytravel.com">
              support@grandluckytravel.com
            </a>
          </span>
        </section>

        {/* Search */}
        <section className="card">
          <div className="card-head">
            <h2>{t.searchLabel}</h2>
            <input
              type="text"
              inputMode="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
            />
          </div>

          <div className="table">
            <div className="thead">
              <div className="cell head">{t.username}</div>
              <div className="cell head right">{t.quizTime}</div>
              <div className="cell head right">{t.group}</div>
            </div>

            <div className="tbody">
              {found.length === 0 ? (
                <div className="row empty">{t.noMatch}</div>
              ) : (
                found.map((r) => (
                  <div className="row" key={`find-${r.username}`}>
                    <div className="cell user">{r.username}</div>
                    <div className="cell time right">{r.time}</div>
                    <div className="cell right">{groupLabel(r.group)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Top 6 */}
        <section className="card">
          <h3 className="list-title">{t.top6}</h3>

          <div className="table tableList">
            <div className="thead">
              <div className="cell head">{t.username}</div>
              <div className="cell head right">{t.quizTime}</div>
              <div className="cell head right">{t.group}</div>
            </div>
            <div className="tbody">
              {TOP6.map((r) => (
                <div className="row" key={`t6-${r.username}`}>
                  <div className="cell user">{r.username}</div>
                  <div className="cell time right">{r.time}</div>
                  <div className="cell right">{t.gTop6}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Next 20 */}
        <section className="card">
          <h3 className="list-title">{t.next20}</h3>

          <div className="table tableList">
            <div className="thead">
              <div className="cell head">{t.username}</div>
              <div className="cell head right">{t.quizTime}</div>
              <div className="cell head right">{t.group}</div>
            </div>
            <div className="tbody">
              {NEXT20.map((r) => (
                <div className="row" key={`n20-${r.username}`}>
                  <div className="cell user">{r.username}</div>
                  <div className="cell time right">{r.time}</div>
                  <div className="cell right">{t.gBackup}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All other finishers */}
        <section className="card">
          <h3 className="list-title">{t.others}</h3>

          <div className="table tableList">
            <div className="thead">
              <div className="cell head">{t.username}</div>
              <div className="cell head right">{t.quizTime}</div>
              <div className="cell head right">{t.group}</div>
            </div>
            <div className="tbody">
              {OTHERS.map((r) => (
                <div className="row" key={`oth-${r.username}`}>
                  <div className="cell user">{r.username}</div>
                  <div className="cell time right">{r.time}</div>
                  <div className="cell right">{t.gOthers}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Page styles */}
      <style jsx>{`
        :root {
          --brand: #f4a546;
          --brand-ink: #6b4a12;
          --ink: #1d1d1f;
          --muted: #6b7280;
          --card: #fffaf2;
          --row-sep: #f0d2a3;
          --head: #f8e8cd;
        }

        * {
          box-sizing: border-box;
        }

        .page {
          padding: 24px 16px 56px;
          color: var(--ink);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
            "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji",
            "Segoe UI Emoji";
        }

        .hero {
          text-align: center;
        }

        .title {
          margin: 0 0 6px;
          font-size: 28px;
          line-height: 1.2;
          font-weight: 800;
          color: #111827;
        }
        .sub {
          margin: 0 0 12px;
          font-size: 16px;
          color: #2d2d2d;
          font-weight: 600;
        }

        .lang {
          display: inline-flex;
          gap: 6px;
          background: #f7e0b6;
          border-radius: 999px;
          padding: 4px;
        }
        .lang button {
          border: 0;
          border-radius: 999px;
          padding: 6px 12px;
          background: transparent;
          font-weight: 700;
          cursor: pointer;
          color: #584015;
        }
        .lang button.on {
          background: #fff;
          color: #111;
          box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08) inset;
        }

        .banner {
          max-width: 980px;
          margin: 16px auto 18px;
          background: #fff7ea;
          border-radius: 10px;
          padding: 14px 16px;
          border: 1px solid #f2d4a6;
          color: #3b2d17;
          font-size: 14px;
        }
        .banner a {
          color: #2a2a2a;
          font-weight: 700;
          text-decoration: underline;
        }

        .card {
          max-width: 980px;
          margin: 14px auto;
          background: #fffdf8;
          border-radius: 12px;
          border: 1px solid #f0d2a3;
          overflow: hidden;
          box-shadow: 0 2px 0 rgba(0, 0, 0, 0.03);
        }

        .card-head {
          padding: 14px 16px;
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 12px;
          align-items: center;
          border-bottom: 1px solid var(--row-sep);
        }
        .card-head h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
        }
        .card-head input {
          width: 100%;
          height: 40px;
          border-radius: 10px;
          border: 1px solid #e3c690;
          padding: 8px 10px;
          outline: none;
          font-size: 14px;
          background: #fff;
        }
        .card-head input::placeholder {
          color: #9a7a41;
        }

        .list-title {
          margin: 14px 16px 8px;
          font-size: 16px;
          font-weight: 800;
        }

        .table {
          display: grid;
          grid-auto-rows: minmax(44px, auto);
        }
        .thead {
          position: sticky;
          top: 0;
          display: grid;
          grid-template-columns: 1fr 160px 120px;
          background: var(--head);
          border-bottom: 1px solid var(--row-sep);
          z-index: 2;
        }
        .tbody {
          display: grid;
        }
        .row {
          display: grid;
          grid-template-columns: 1fr 160px 120px;
          background: #fff;
          border-bottom: 1px solid var(--row-sep);
        }
        .row:last-child {
          border-bottom: 0;
        }
        .cell {
          padding: 12px 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 15px;
        }
        .cell.head {
          font-weight: 800;
          font-size: 14px;
          color: #3e2d05;
        }
        .cell.user {
          font-variant-numeric: tabular-nums;
        }
        .cell.time {
          font-variant-numeric: tabular-nums;
          font-feature-settings: "tnum";
        }
        .right {
          text-align: right;
        }
        .empty {
          grid-template-columns: 1fr;
          color: var(--muted);
          background: #fff;
        }

        /* Dedicated scrolling area for the lists so headers stick nicely */
        .tableList {
          max-height: 360px;
          overflow-y: auto;
          border-top: 1px solid var(--row-sep);
        }

        /* Mobile */
        @media (max-width: 820px) {
          .card-head {
            grid-template-columns: 1fr;
          }
          .table .thead,
          .table .row {
            grid-template-columns: 1fr 130px 110px;
          }
          .cell {
            font-size: 14px;
            padding: 10px 12px;
          }
        }
        @media (max-width: 420px) {
          .table .thead,
          .table .row {
            grid-template-columns: 1fr 118px 100px;
          }
          .title {
            font-size: 22px;
          }
          .sub {
            font-size: 14px;
          }
        }
      `}</style>

      {/* Force brand yellow page background globally */}
      <style jsx global>{`
        html,
        body,
        #__next {
          background: #f4a546 !important;
        }
      `}</style>
    </>
  );
}
