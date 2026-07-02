export type Lang='es'|'ja'|'zh-CN'|'zh-TW'|'fr'|'de'
export type StoryParaTranslation={id:string;translation:string}
export type StoryLangEntry={subtitle:string;storyNote:string;paragraphs:StoryParaTranslation[]}
export type StoryTranslation={storyId:number;translations:Record<Lang,StoryLangEntry>}
export const storyTranslationsBatch2:StoryTranslation[]=[
  {
    "storyId": 26,
    "translations": {
      "es": {
        "subtitle": "Banco y servicios",
        "storyNote": "Habla de dinero de forma breve y precisa.",
        "paragraphs": [
          {
            "id": "p26-1",
            "translation": "Tomé un número y esperé mi turno. \"Vengo a abrir una cuenta corriente\", dije en la ventanilla. Ella deslizó un formulario sobre el mostrador."
          },
          {
            "id": "p26-2",
            "translation": "La máquina expendedora solo aceptaba monedas. \"¿Podrías cambiarme un billete de veinte?\", le pregunté al cajero. Ella contó billetes más pequeños con una sonrisa."
          },
          {
            "id": "p26-3",
            "translation": "Leí el formulario dos veces antes de firmar. \"¿Hay comisión por transferencias al extranjero?\", pregunté. Ella señaló una pequeña línea al final."
          },
          {
            "id": "p26-4",
            "translation": "La factura tenía algunos cargos que no reconocía. \"¿Cuánto debo en total?\", pregunté. Ella me imprimió un resumen claro."
          },
          {
            "id": "p26-5",
            "translation": "Busqué mi cartera en el mostrador. \"¿Puedo pagar con tarjeta o solo en efectivo?\", pregunté. Ella tocó la pequeña máquina y dijo que ambas formas funcionan."
          }
        ]
      },
      "ja": {
        "subtitle": "銀行・公共料金",
        "storyNote": "お金の話は短く正確に。",
        "paragraphs": [
          {
            "id": "p26-1",
            "translation": "番号をとって順番を待ちました。「普通預金口座を開設したいんです」と窓口で言いました。彼女は書類をカウンターの向こうに滑らせました。"
          },
          {
            "id": "p26-2",
            "translation": "自動販売機はコインだけを受け付けました。「20ドルを両替してもらえますか？」と行員に聞きました。彼女は笑顔で小さい紙幣を数えてくれました。"
          },
          {
            "id": "p26-3",
            "translation": "署名する前に書類を2回読みました。「海外送金の手数料はありますか？」と聞きました。彼女は下部の小さい行を指しました。"
          },
          {
            "id": "p26-4",
            "translation": "請求書にはいくつか心当たりのない手数料がありました。「合計いくら支払えばいいですか？」と聞きました。彼女は明確な明細を印刷してくれました。"
          },
          {
            "id": "p26-5",
            "translation": "カウンターで財布に手を伸ばしました。「カードで払えますか、それとも現金だけですか？」と聞きました。彼女は小さい機械をタップして、どちらでも大丈夫だと言いました。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "银行和公共服务费",
        "storyNote": "谈论金钱要简短准确。",
        "paragraphs": [
          {
            "id": "p26-1",
            "translation": "我取了一个号码并等候轮到我。\"我来开一个支票账户，\"我在窗口说道。她把一张表格推过柜台。"
          },
          {
            "id": "p26-2",
            "translation": "自动售货机只接受硬币。\"你能帮我换开一张二十块的吗？\"我问出纳员。她带着微笑数出了面额更小的纸币。"
          },
          {
            "id": "p26-3",
            "translation": "签名前我读了两遍表格。\"国际转账有手续费吗？\"我问道。她指向底部的一小行字。"
          },
          {
            "id": "p26-4",
            "translation": "账单上有几项我不认识的费用。\"我一共要支付多少？\"我问。她为我打印了一份清晰的总结。"
          },
          {
            "id": "p26-5",
            "translation": "我在柜台前伸手去拿钱包。\"我可以刷卡还是只能用现金？\"我问道。她轻触了那台小机器，说两种方式都可以。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "銀行和公共服務費",
        "storyNote": "談論金錢要簡短準確。",
        "paragraphs": [
          {
            "id": "p26-1",
            "translation": "我取了一個號碼並等候輪到我。\"我來開一個支票帳戶，\"我在窗口說道。她把一張表格推過櫃台。"
          },
          {
            "id": "p26-2",
            "translation": "自動售貨機只接受硬幣。\"你能幫我換開一張二十塊的嗎？\"我問出納員。她帶著微笑數出了面額更小的紙幣。"
          },
          {
            "id": "p26-3",
            "translation": "簽名前我讀了兩遍表格。\"國際轉帳有手續費嗎？\"我問道。她指向底部的一小行字。"
          },
          {
            "id": "p26-4",
            "translation": "帳單上有幾項我不認識的費用。\"我一共要支付多少？\"我問。她為我列印了一份清晰的總結。"
          },
          {
            "id": "p26-5",
            "translation": "我在櫃台前伸手去拿錢包。\"我可以刷卡還是只能用現金？\"我問道。她輕觸了那台小機器，說兩種方式都可以。"
          }
        ]
      },
      "fr": {
        "subtitle": "Banque et services publics",
        "storyNote": "Parlez d'argent de manière brève et précise.",
        "paragraphs": [
          {
            "id": "p26-1",
            "translation": "J'ai pris un numéro et j'ai attendu mon tour. \"Je suis venu ouvrir un compte chèques\", ai-je dit au guichet. Elle a glissé un formulaire sur le comptoir."
          },
          {
            "id": "p26-2",
            "translation": "Le distributeur automatique n'acceptait que les pièces. \"Pouvez-vous me changer un billet de vingt?\", ai-je demandé au caissier. Elle a compté les petits billets avec un sourire."
          },
          {
            "id": "p26-3",
            "translation": "J'ai lu le formulaire deux fois avant de signer. \"Y a-t-il des frais pour les transferts à l'étranger?\", ai-je demandé. Elle a pointé une petite ligne en bas."
          },
          {
            "id": "p26-4",
            "translation": "La facture contenait quelques frais que je ne reconnaissais pas. \"Combien dois-je au total?\", ai-je demandé. Elle a imprimé un résumé clair pour moi."
          },
          {
            "id": "p26-5",
            "translation": "J'ai tendu la main vers mon portefeuille au comptoir. \"Puis-je payer par carte ou c'est espèces uniquement?\", ai-je demandé. Elle a appuyé sur la petite machine et a dit que les deux fonctionnent."
          }
        ]
      },
      "de": {
        "subtitle": "Bank und Nebenkosten",
        "storyNote": "Sprechen Sie kurz und präzise über Geld.",
        "paragraphs": [
          {
            "id": "p26-1",
            "translation": "Ich zog eine Nummer und wartete an der Reihe. \"Ich möchte ein Girokonto eröffnen\", sagte ich am Schalter. Sie schob ein Formular über den Tresen."
          },
          {
            "id": "p26-2",
            "translation": "Der Automat nahm nur Münzen. \"Könnten Sie mir einen Zwanzig-Dollar-Schein wechseln?\", fragte ich den Kassierer. Sie zählte kleinere Geldscheine mit einem Lächeln aus."
          },
          {
            "id": "p26-3",
            "translation": "Ich las das Formular zweimal durch, bevor ich es unterschrieb. \"Gibt es eine Gebühr für Auslandsüberweisungen?\", fragte ich. Sie deutete auf eine kleine Zeile unten."
          },
          {
            "id": "p26-4",
            "translation": "Die Rechnung enthielt einige Gebühren, die ich nicht erkannte. \"Wie viel schulde ich insgesamt?\", fragte ich. Sie druckte eine klare Zusammenfassung für mich aus."
          },
          {
            "id": "p26-5",
            "translation": "Ich griff nach meiner Geldbörse am Schalter. \"Kann ich mit Karte zahlen oder nur bar?\", fragte ich. Sie tippte auf das kleine Gerät und sagte, dass beides funktioniert."
          }
        ]
      }
    }
  },
  {
    "storyId": 27,
    "translations": {
      "es": {
        "subtitle": "En el aeropuerto",
        "storyNote": "En el aeropuerto se habla rápido y con claridad.",
        "paragraphs": [
          {
            "id": "p27-1",
            "translation": "Llevé mi maleta hasta el mostrador. \"Estoy facturando para el vuelo a Roma\", dije. El agente me pidió el pasaporte."
          },
          {
            "id": "p27-2",
            "translation": "Los carteles señalaban en tres direcciones a la vez. \"¿Dónde dejo mi equipaje facturado?\", pregunté. Ella me hizo un gesto hacia el mostrador del fondo."
          },
          {
            "id": "p27-3",
            "translation": "El embarque no era hasta cuarenta minutos después. \"¿Tengo tiempo para tomar un café?\", le pregunté al agente. Ella sonrió y dijo que sí, que había tiempo de sobra."
          },
          {
            "id": "p27-4",
            "translation": "La pantalla de la puerta aún no mostraba ningún número. \"¿A qué hora comienza el embarque?\", pregunté. Ella dijo que en aproximadamente veinte minutos."
          },
          {
            "id": "p27-5",
            "translation": "La tarjeta de embarque y el cartel no coincidían. \"Creo que estoy en la puerta equivocada\", le dije al agente. Él me señaló hacia otra terminal."
          }
        ]
      },
      "ja": {
        "subtitle": "空港",
        "storyNote": "空港では早く、はっきりと話します。",
        "paragraphs": [
          {
            "id": "p27-1",
            "translation": "スーツケースをカウンターまで転がしていきました。「ローマ行きのフライトにチェックインしたいです」と言いました。係員はパスポートを求めました。"
          },
          {
            "id": "p27-2",
            "translation": "標識が三つの方向を指していました。「預ける荷物はどこで預けますか？」と聞きました。彼女は奥のカウンターを指しました。"
          },
          {
            "id": "p27-3",
            "translation": "搭乗はあと40分後でした。「コーヒーを飲む時間はありますか？」と係員に聞きました。彼女は笑顔でたっぷりあると言いました。"
          },
          {
            "id": "p27-4",
            "translation": "ゲートの画面にはまだ番号が表示されていません。「搭乗開始は何時ですか？」と聞きました。彼女は約20分後だと言いました。"
          },
          {
            "id": "p27-5",
            "translation": "搭乗券と標識が一致しませんでした。「間違ったゲートにいるようです」と係員に言いました。彼はもう一つ先のターミナルを指しました。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "机场",
        "storyNote": "在机场说话要快速清晰。",
        "paragraphs": [
          {
            "id": "p27-1",
            "translation": "我推着行李箱来到柜台。\"我要办理飞往罗马的航班登机手续，\"我说。工作人员要求看我的护照。"
          },
          {
            "id": "p27-2",
            "translation": "标志同时指向三个方向。\"我的托运行李在哪里办理？\"我问道。她向我指向远处的柜台。"
          },
          {
            "id": "p27-3",
            "translation": "登机还要再等四十分钟。\"我有时间去买杯咖啡吗？\"我问工作人员。她笑着说有的是时间。"
          },
          {
            "id": "p27-4",
            "translation": "登机口的屏幕上仍然没有显示登机口号。\"登机什么时候开始？\"我问道。她说大约二十分钟后。"
          },
          {
            "id": "p27-5",
            "translation": "登机牌和标志不匹配。\"我想我来错登机口了，\"我告诉工作人员。他指向我隔壁的航站楼。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "機場",
        "storyNote": "在機場說話要快速清晰。",
        "paragraphs": [
          {
            "id": "p27-1",
            "translation": "我推著行李箱來到櫃台。\"我要辦理飛往羅馬的航班登機手續，\"我說。工作人員要求看我的護照。"
          },
          {
            "id": "p27-2",
            "translation": "標誌同時指向三個方向。\"我的托運行李在哪裡辦理？\"我問道。她向我指向遠處的櫃台。"
          },
          {
            "id": "p27-3",
            "translation": "登機還要再等四十分鐘。\"我有時間去買杯咖啡嗎？\"我問工作人員。她笑著說有的是時間。"
          },
          {
            "id": "p27-4",
            "translation": "登機口的螢幕上仍然沒有顯示登機口號。\"登機什麼時候開始？\"我問道。她說大約二十分鐘後。"
          },
          {
            "id": "p27-5",
            "translation": "登機牌和標誌不匹配。\"我想我來錯登機口了，\"我告訴工作人員。他指向我隔壁的航站樓。"
          }
        ]
      },
      "fr": {
        "subtitle": "À l'aéroport",
        "storyNote": "À l'aéroport, on parle vite et clairement.",
        "paragraphs": [
          {
            "id": "p27-1",
            "translation": "J'ai poussé ma valise jusqu'au comptoir. « J'enregistre pour le vol pour Rome », ai-je dit. L'agent m'a demandé mon passeport."
          },
          {
            "id": "p27-2",
            "translation": "Les panneaux pointaient dans trois directions à la fois. « Où je dépose mes bagages en soute ? », ai-je demandé. Elle m'a fait signe vers le comptoir du fond."
          },
          {
            "id": "p27-3",
            "translation": "L'embarquement n'était que dans quarante minutes. « J'ai le temps d'aller prendre un café ? », ai-je demandé à l'agent. Elle a souri et dit que oui, bien sûr."
          },
          {
            "id": "p27-4",
            "translation": "L'écran de la porte n'affichait toujours aucun numéro. « À quelle heure commence l'embarquement ? », ai-je demandé. Elle a dit dans environ vingt minutes."
          },
          {
            "id": "p27-5",
            "translation": "La carte d'embarquement et le panneau ne correspondaient pas. « Je crois que je suis à la mauvaise porte », ai-je dit à l'agent. Il m'a pointé le terminal d'à côté."
          }
        ]
      },
      "de": {
        "subtitle": "Am Flughafen",
        "storyNote": "Am Flughafen spricht man schnell und deutlich.",
        "paragraphs": [
          {
            "id": "p27-1",
            "translation": "Ich rollte meinen Koffer zum Schalter. \"Ich möchte mich für den Flug nach Rom anmelden\", sagte ich. Der Agent forderte meinen Pass an."
          },
          {
            "id": "p27-2",
            "translation": "Schilder zeigten gleichzeitig in drei Richtungen. \"Wo kann ich mein aufgegebenes Gepäck abgeben?\", fragte ich. Sie deutete auf den Schalter am anderen Ende."
          },
          {
            "id": "p27-3",
            "translation": "Das Boarding sollte erst in vierzig Minuten stattfinden. \"Habe ich Zeit, mir einen Kaffee zu holen?\", fragte ich den Agent. Sie lächelte und sagte, ja, reichlich Zeit."
          },
          {
            "id": "p27-4",
            "translation": "Das Gatter-Display zeigte noch keine Nummer an. \"Wann beginnt das Boarding?\", fragte ich. Sie sagte in etwa zwanzig Minuten."
          },
          {
            "id": "p27-5",
            "translation": "Die Bordkarte und das Schild stimmten nicht überein. \"Ich glaube, ich bin am falschen Gate\", sagte ich zum Agent. Er deutete auf das nächste Terminal."
          }
        ]
      }
    }
  },
  {
    "storyId": 28,
    "translations": {
      "es": {
        "subtitle": "Hotel",
        "storyNote": "Con una palabra sobre el hotel, tu viaje se vuelve mucho más fácil.",
        "paragraphs": [
          {
            "id": "p28-1",
            "translation": "El vestíbulo estaba fresco y tranquilo después del largo vuelo. \"Tengo una reservación a nombre de Kim\", dije. Él la encontró y extendió una tarjeta de acceso."
          },
          {
            "id": "p28-2",
            "translation": "Explicó la tarifa de la habitación en el mostrador. \"¿El desayuno está incluido en el precio?\", pregunté. Dijo que sí, hasta las diez cada mañana."
          },
          {
            "id": "p28-3",
            "translation": "Nuestro vuelo aterrizó horas antes. \"¿Es posible hacer el check-in temprano?\", pregunté. Verificó y dijo que la habitación estaba lista."
          },
          {
            "id": "p28-4",
            "translation": "Intenté usar el panel varias veces sin éxito. \"El aire acondicionado no funciona\", llamé hacia abajo. Enviaron a alguien en minutos."
          },
          {
            "id": "p28-5",
            "translation": "Dejamos nuestras maletas y ya teníamos hambre. \"¿Hay algún buen lugar para comer cerca?\", pregunté. Marcó dos lugares en un pequeño mapa."
          }
        ]
      },
      "ja": {
        "subtitle": "ホテル",
        "storyNote": "ホテルのことで分からないことがあったら、旅行がもっと楽になります。",
        "paragraphs": [
          {
            "id": "p28-1",
            "translation": "長いフライトの後、ロビーは涼しく静かでした。「キムの名前で予約しています」と私は言いました。彼は予約を見つけ、キーカードを差し出しました。"
          },
          {
            "id": "p28-2",
            "translation": "彼はデスクで部屋の料金を説明しました。「朝食は価格に含まれていますか?」と私は聞きました。彼は毎朝10時までと言いました。"
          },
          {
            "id": "p28-3",
            "translation": "私たちのフライトは数時間早くに着陸しました。「早めのチェックインは可能ですか?」と私は聞きました。彼は確認して、部屋の準備ができていると言いました。"
          },
          {
            "id": "p28-4",
            "translation": "何度かパネルを試しましたがうまくいきません。「エアコンが動きません」と下に電話しました。数分で誰かが来てくれました。"
          },
          {
            "id": "p28-5",
            "translation": "荷物を置いて、もうお腹が空いていました。「近くに何か良い食べ物の場所はありますか?」と私は聞きました。彼は小さな地図に2つの場所を記しました。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "酒店",
        "storyNote": "掌握酒店的基本信息，让你的旅行变得更加轻松。",
        "paragraphs": [
          {
            "id": "p28-1",
            "translation": "经过长途飞行后，大厅显得凉爽而安静。\"我有一个以金先生名义预订的房间,\"我说。他找到了预订单，递给了我一张房卡。"
          },
          {
            "id": "p28-2",
            "translation": "他在前台向我说明了房间的价格。\"早餐包含在价格里吗?\"我问。他说包含，每天早上到十点。"
          },
          {
            "id": "p28-3",
            "translation": "我们的飞机提前几小时着陆。\"能提前入住吗?\"我问。他查了一下说房间已经准备好了。"
          },
          {
            "id": "p28-4",
            "translation": "我试了几次控制面板但没有反应。\"空调坏了,\"我打电话下楼。他们几分钟内就派人上来了。"
          },
          {
            "id": "p28-5",
            "translation": "我们放下行李后就感到饿了。\"附近有什么好吃的地方吗?\"我问。他在一张小地图上标记了两个地方。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "飯店",
        "storyNote": "掌握飯店的基本資訊，讓你的旅行變得更加輕鬆。",
        "paragraphs": [
          {
            "id": "p28-1",
            "translation": "經過長途飛行後，大廳顯得涼爽而安靜。\"我有一個以金先生名義預訂的房間,\"我說。他找到了預訂單，遞給了我一張房卡。"
          },
          {
            "id": "p28-2",
            "translation": "他在前台向我說明了房間的價格。\"早餐包含在價格裡嗎?\"我問。他說包含，每天早上到十點。"
          },
          {
            "id": "p28-3",
            "translation": "我們的飛機提前幾小時著陸。\"能提前入住嗎?\"我問。他查了一下說房間已經準備好了。"
          },
          {
            "id": "p28-4",
            "translation": "我試了幾次控制面板但沒有反應。\"冷氣壞了,\"我打電話下樓。他們幾分鐘內就派人上來了。"
          },
          {
            "id": "p28-5",
            "translation": "我們放下行李後就感到餓了。\"附近有什麼好吃的地方嗎?\"我問。他在一張小地圖上標記了兩個地方。"
          }
        ]
      },
      "fr": {
        "subtitle": "Hôtel",
        "storyNote": "Connaître les bases de l'hôtel rend vos voyages beaucoup plus faciles.",
        "paragraphs": [
          {
            "id": "p28-1",
            "translation": "Le hall d'entrée était frais et calme après le long vol. \"J'ai une réservation au nom de Kim,\" dis-je. Il l'a trouvée et m'a tendu une carte d'accès."
          },
          {
            "id": "p28-2",
            "translation": "Il a expliqué le tarif de la chambre à la réception. \"Le petit-déjeuner est-il inclus dans le prix?\" ai-je demandé. Il a dit oui, jusqu'à dix heures chaque matin."
          },
          {
            "id": "p28-3",
            "translation": "Notre vol a atterri plusieurs heures plus tôt. \"Est-il possible de faire l'enregistrement plus tôt?\" ai-je demandé. Il a vérifié et a dit que la chambre était prête."
          },
          {
            "id": "p28-4",
            "translation": "J'ai essayé le panneau plusieurs fois sans succès. \"La climatisation ne fonctionne pas,\" ai-je appelé en bas. Quelqu'un est monté en quelques minutes."
          },
          {
            "id": "p28-5",
            "translation": "Nous avons posé nos sacs et avions déjà faim. \"Y a-t-il un bon endroit pour manger à proximité?\" ai-je demandé. Il a marqué deux endroits sur une petite carte."
          }
        ]
      },
      "de": {
        "subtitle": "Hotel",
        "storyNote": "Mit ein paar Informationen zum Hotel wird deine Reise viel leichter.",
        "paragraphs": [
          {
            "id": "p28-1",
            "translation": "Die Lobby war kühl und ruhig nach dem langen Flug. \"Ich habe eine Reservierung unter Kim,\" sagte ich. Er fand sie und reichte mir eine Keycard."
          },
          {
            "id": "p28-2",
            "translation": "Er erklärte mir den Zimmerpreis an der Rezeption. \"Ist das Frühstück im Preis inbegriffen?\" fragte ich. Er sagte ja, bis zehn Uhr morgens."
          },
          {
            "id": "p28-3",
            "translation": "Unser Flug landete Stunden früher. \"Ist ein früherer Check-in möglich?\" fragte ich. Er überprüfte und sagte, das Zimmer sei bereit."
          },
          {
            "id": "p28-4",
            "translation": "Ich versuchte mehrmals, das Bedienfeld zu betätigen, aber vergeblich. \"Die Klimaanlage funktioniert nicht,\" rief ich nach unten. Sie schickten jemanden in wenigen Minuten rauf."
          },
          {
            "id": "p28-5",
            "translation": "Wir warfen unsere Taschen hin und hatten bereits Hunger. \"Gibt es in der Nähe einen guten Platz zum Essen?\" fragte ich. Er markierte zwei Orte auf einer kleinen Karte."
          }
        ]
      }
    }
  },
  {
    "storyId": 29,
    "translations": {
      "es": {
        "subtitle": "Taxi y preguntar el camino",
        "storyNote": "Es suficiente con saber el destino y la ruta.",
        "paragraphs": [
          {
            "id": "p29-1",
            "translation": "Me incliné hacia el conductor mientras nos alejábamos. «Necesito llegar al aeropuerto antes de las seis», dije. Asintió y tomó la carretera más rápida."
          },
          {
            "id": "p29-2",
            "translation": "Observé el taxímetro y el mapa al mismo tiempo. «¿Está lejos el casco antiguo desde aquí?», pregunté. Dijo que diez minutos sin tráfico."
          },
          {
            "id": "p29-3",
            "translation": "Bajé del taxi y todas las calles se veían iguales. «Disculpe, ¿por dónde queda la estación?», pregunté. Un local señaló más allá de la panadería."
          },
          {
            "id": "p29-4",
            "translation": "Llegamos a la acera y abrí mi cartera. «¿Aceptan tarjetas o solo efectivo?», pregunté. Tocó un pequeño lector en el tablero."
          },
          {
            "id": "p29-5",
            "translation": "La tarifa fue poco menos de veinte. «Aquí hay veinte — quédate con el cambio», dije. Me dio las gracias y me deseó un buen viaje."
          }
        ]
      },
      "ja": {
        "subtitle": "タクシー・道を尋ねる",
        "storyNote": "目的地と経路が分かれば十分です。",
        "paragraphs": [
          {
            "id": "p29-1",
            "translation": "車が動き始めると、私は運転手の方に身を乗り出した。「6時までに空港に着かないといけないんです」と言った。彼は頷いて、もっと早い道を選んだ。"
          },
          {
            "id": "p29-2",
            "translation": "私はメーターと地図を同時に見ていた。「ここから旧市街まで遠いですか?」と尋ねた。彼は渋滞がなければ10分だと言った。"
          },
          {
            "id": "p29-3",
            "translation": "車を降りると、どの通りも同じに見えた。「すみません、駅はどちらですか?」と尋ねた。地元の人がパン屋の先を指差した。"
          },
          {
            "id": "p29-4",
            "translation": "私たちは歩道に着き、財布を開いた。「カードでいいですか、それともキャッシュだけですか?」と尋ねた。彼はダッシュボードの小さなリーダーをタップした。"
          },
          {
            "id": "p29-5",
            "translation": "料金は20未満だった。「20ドルです。お釣りはとっておいてください」と言った。彼は感謝してくれ、いい旅をと願ってくれた。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "出租车和问路",
        "storyNote": "只要知道目的地和路线就足够了。",
        "paragraphs": [
          {
            "id": "p29-1",
            "translation": "当车开动时，我向司机靠近。\"我需要在六点前到达机场，\"我说。他点点头，选择了更快的路线。"
          },
          {
            "id": "p29-2",
            "translation": "我同时盯着计价器和地图。\"从这里到老城区远吗？\"我问道。他说没有交通堵塞的话要十分钟。"
          },
          {
            "id": "p29-3",
            "translation": "我下车后，周围的街道看起来都一样。\"请问，火车站往哪个方向走？\"我问道。一位当地人指着面包店的那边。"
          },
          {
            "id": "p29-4",
            "translation": "我们到达路边，我打开了钱包。\"你们接受刷卡还是只收现金？\"我问道。他拍了拍仪表板上的一个小读卡器。"
          },
          {
            "id": "p29-5",
            "translation": "车费不到二十块钱。\"给你二十块——零钱就不用找了，\"我说。他感谢我，并祝我旅途愉快。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "計程車和問路",
        "storyNote": "只要知道目的地和路線就足夠了。",
        "paragraphs": [
          {
            "id": "p29-1",
            "translation": "當車開動時，我向司機靠近。「我需要在六點前到達機場，」我說。他點點頭，選擇了更快的路線。"
          },
          {
            "id": "p29-2",
            "translation": "我同時盯著計價器和地圖。「從這裡到老城區遠嗎？」我問道。他說沒有交通堵塞的話要十分鐘。"
          },
          {
            "id": "p29-3",
            "translation": "我下車後，周圍的街道看起來都一樣。「請問，火車站往哪個方向走？」我問道。一位當地人指著麵包店的那邊。"
          },
          {
            "id": "p29-4",
            "translation": "我們到達路邊，我打開了錢包。「你們接受刷卡還是只收現金？」我問道。他拍了拍儀表板上的一個小讀卡器。"
          },
          {
            "id": "p29-5",
            "translation": "車費不到二十塊錢。「給你二十塊——零錢就不用找了，」我說。他感謝我，並祝我旅途愉快。"
          }
        ]
      },
      "fr": {
        "subtitle": "Taxi et demander son chemin",
        "storyNote": "Il suffit de connaître la destination et l'itinéraire.",
        "paragraphs": [
          {
            "id": "p29-1",
            "translation": "Je me suis penché vers le chauffeur alors que nous partions. « Je dois arriver à l'aéroport avant six heures », ai-je dit. Il a hoché la tête et a pris la route la plus rapide."
          },
          {
            "id": "p29-2",
            "translation": "J'ai observé le compteur et la carte en même temps. « Est-ce loin jusqu'à la vieille ville d'ici ? », ai-je demandé. Il a dit dix minutes sans embouteillages."
          },
          {
            "id": "p29-3",
            "translation": "Je suis descendu et toutes les rues se ressemblaient. « Excusez-moi, par où se trouve la gare ? », ai-je demandé. Un habitant a indiqué au-delà de la boulangerie."
          },
          {
            "id": "p29-4",
            "translation": "Nous avons atteint le trottoir et j'ai ouvert mon portefeuille. « Acceptez-vous les cartes ou uniquement l'espèces ? », ai-je demandé. Il a tapé sur un petit lecteur sur le tableau de bord."
          },
          {
            "id": "p29-5",
            "translation": "La course était un peu moins de vingt. « Voici vingt — gardez la monnaie », ai-je dit. Il m'a remercié et m'a souhaité un bon voyage."
          }
        ]
      },
      "de": {
        "subtitle": "Taxi und Wegfragen",
        "storyNote": "Es reicht aus, das Ziel und die Route zu kennen.",
        "paragraphs": [
          {
            "id": "p29-1",
            "translation": "Ich lehnte mich zum Fahrer vor, während wir losfuhren. «Ich muss bis sechs Uhr am Flughafen sein», sagte ich. Er nickte und nahm die schnellere Straße."
          },
          {
            "id": "p29-2",
            "translation": "Ich beobachtete gleichzeitig die Uhr und die Karte. «Ist es weit von hier zur Altstadt?», fragte ich. Er sagte zehn Minuten ohne Verkehr."
          },
          {
            "id": "p29-3",
            "translation": "Ich stieg aus und alle Straßen sahen gleich aus. «Entschuldigung, in welche Richtung ist der Bahnhof?», fragte ich. Ein Einheimischer deutete über die Bäckerei hinaus."
          },
          {
            "id": "p29-4",
            "translation": "Wir erreichten den Gehweg und ich öffnete mein Portemonnaie. «Nehmt ihr Karten oder nur Bargeld?», fragte ich. Er tippte auf ein kleines Lesegerät am Armaturenbrett."
          },
          {
            "id": "p29-5",
            "translation": "Die Fahrt kostete knapp zwanzig. «Hier sind zwanzig — der Rest ist für dich», sagte ich. Er dankte mir und wünschte mir eine gute Reise."
          }
        ]
      }
    }
  },
  {
    "storyId": 30,
    "translations": {
      "es": {
        "subtitle": "Conducción",
        "storyNote": "Compartir situaciones con una palabra mientras se conduce.",
        "paragraphs": [
          {
            "id": "p30-1",
            "translation": "La pequeña luz naranja parpadeaba ante mí. \"Se nos está acabando la gasolina\", le dije. Entramos en la siguiente gasolinera justo a tiempo."
          },
          {
            "id": "p30-2",
            "translation": "Las luces de freno se extendían hasta el horizonte. \"Estamos atrapados en el tráfico otra vez\", suspiré. Ella subió el volumen de la música para mantener la cordura."
          },
          {
            "id": "p30-3",
            "translation": "Un ciclista se desvió entre dos coches. \"¡Cuidado con la bicicleta!\", dije rápidamente. Ella frenó suavemente y ambos respiramos aliviados."
          },
          {
            "id": "p30-4",
            "translation": "Habíamos estado conduciendo casi tres horas. \"Deberíamos parar un momento para descansar\", sugerí. Nos estiramos en una pequeña área de descanso."
          },
          {
            "id": "p30-5",
            "translation": "El reloj y el tráfico lucían amenazadores. \"Será mejor que nos vayamos ahora para evitar la hora punta\", dije. Ella agarró las llaves sin protestar."
          }
        ]
      },
      "ja": {
        "subtitle": "運転",
        "storyNote": "運転中の状況をひと言で共有する。",
        "paragraphs": [
          {
            "id": "p30-1",
            "translation": "小さなオレンジ色のランプが点滅している。「ガソリンがなくなりかけてる」と彼女に言った。間一髪でガソリンスタンドに滑り込んだ。"
          },
          {
            "id": "p30-2",
            "translation": "ブレーキランプが果てしなく続いている。「また渋滞だ」とため息をついた。彼女は正気を保つために音楽を大きくした。"
          },
          {
            "id": "p30-3",
            "translation": "自転車が二台の車の間から急に飛び出してきた。「自転車に気をつけて！」と素早く言った。彼女は滑らかにブレーキをかけ、二人とも息をついた。"
          },
          {
            "id": "p30-4",
            "translation": "ほぼ三時間運転していた。「ちょっと休憩するために立ち寄ろう」と提案した。小さな休憩所で足を伸ばした。"
          },
          {
            "id": "p30-5",
            "translation": "時計も交通状況も厳しく見えた。「ラッシュアワーを避けるために今出発したほうがいい」と言った。彼女は文句も言わずに鍵を掴んだ。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "驾驶",
        "storyNote": "用简短的话语分享驾驶中的情况。",
        "paragraphs": [
          {
            "id": "p30-1",
            "translation": "小橙灯在我面前闪烁。\"我们快没油了，\"我告诉她。我们及时驶入下一个加油站。"
          },
          {
            "id": "p30-2",
            "translation": "刹车灯延伸到无尽远处。\"我们又陷入交通堵塞了，\"我叹了口气。她调大音乐来保持我们的理智。"
          },
          {
            "id": "p30-3",
            "translation": "一辆自行车从两辆车之间突然转向。\"小心那辆自行车！\"我快速说道。她平稳地踩下刹车，我们都松了口气。"
          },
          {
            "id": "p30-4",
            "translation": "我们已经开了将近三个小时。\"我们在这里停一下休息一会儿吧，\"我建议说。我们在一个小的休息站伸展了腿。"
          },
          {
            "id": "p30-5",
            "translation": "时钟和交通状况看起来都很糟糕。\"我们最好现在就出发，赶在高峰期之前，\"我说。她二话不说地拿起钥匙。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "駕駛",
        "storyNote": "用簡短的話語分享駕駛中的情況。",
        "paragraphs": [
          {
            "id": "p30-1",
            "translation": "小橙燈在我面前閃爍。\"我們快沒油了，\"我告訴她。我們及時駛入下一個加油站。"
          },
          {
            "id": "p30-2",
            "translation": "煞車燈延伸到無盡遠處。\"我們又陷入交通堵塞了，\"我嘆了口氣。她調大音樂來保持我們的理智。"
          },
          {
            "id": "p30-3",
            "translation": "一輛自行車從兩輛車之間突然轉向。\"小心那輛自行車！\"我快速說道。她平穩地踩下煞車，我們都鬆了口氣。"
          },
          {
            "id": "p30-4",
            "translation": "我們已經開了將近三個小時。\"我們在這裡停一下休息一會兒吧，\"我建議說。我們在一個小的休息站伸展了腿。"
          },
          {
            "id": "p30-5",
            "translation": "時鐘和交通狀況看起來都很糟糕。\"我們最好現在就出發，趕在高峰期之前，\"我說。她二話不說地拿起鑰匙。"
          }
        ]
      },
      "fr": {
        "subtitle": "La conduite",
        "storyNote": "Partager des situations en un mot pendant qu'on conduit.",
        "paragraphs": [
          {
            "id": "p30-1",
            "translation": "Le petit voyant orange clignotait devant moi. \"On n'a presque plus d'essence\", lui ai-je dit. Nous avons franchi la station suivante juste à temps."
          },
          {
            "id": "p30-2",
            "translation": "Les feux de freinage s'étendaient à l'infini. \"Nous sommes de nouveau bloqués dans les embouteillages\", ai-je soupiré. Elle a augmenté le volume de la musique pour garder notre sang-froid."
          },
          {
            "id": "p30-3",
            "translation": "Un cycliste a déboîté entre deux voitures. \"Attention au vélo !\" ai-je dit rapidement. Elle a freiné en douceur et nous avons tous deux soupiré de soulagement."
          },
          {
            "id": "p30-4",
            "translation": "Nous conduisions depuis presque trois heures. \"Arrêtons-nous un moment pour nous reposer\", ai-je suggéré. Nous nous sommes étirés dans une petite aire de repos."
          },
          {
            "id": "p30-5",
            "translation": "L'horloge et les embouteillages avaient l'air inquiétants. \"On ferait mieux de partir maintenant pour éviter l'heure de pointe\", ai-je dit. Elle a saisi ses clés sans discuter."
          }
        ]
      },
      "de": {
        "subtitle": "Fahren",
        "storyNote": "Situationen während der Fahrt mit wenigen Worten teilen.",
        "paragraphs": [
          {
            "id": "p30-1",
            "translation": "Das kleine orangefarbene Licht blinkte mich an. \"Uns geht das Benzin aus\", sagte ich ihr. Wir schafften es gerade noch zur nächsten Tankstelle."
          },
          {
            "id": "p30-2",
            "translation": "Die Bremslichter erstreckten sich bis zum Horizont. \"Wir sitzen schon wieder im Stau\", seufzte ich. Sie drehte die Musik lauter, um uns bei Verstand zu halten."
          },
          {
            "id": "p30-3",
            "translation": "Ein Radfahrer wich plötzlich zwischen zwei Autos aus. \"Pass auf das Fahrrad auf!\", sagte ich schnell. Sie bremste sanft und wir beide atmeten auf."
          },
          {
            "id": "p30-4",
            "translation": "Wir waren fast drei Stunden lang gefahren. \"Lass uns kurz anhalten und eine Pause machen\", schlug ich vor. Wir streckten uns an einer kleinen Raststätte die Beine."
          },
          {
            "id": "p30-5",
            "translation": "Die Uhr und der Verkehr sahen düster aus. \"Wir sollten jetzt losfahren, um der Rushhour zu entgehen\", sagte ich. Sie schnappte sich ihre Schlüssel ohne zu widersprechen."
          }
        ]
      }
    }
  },
  {
    "storyId": 31,
    "translations": {
      "es": {
        "subtitle": "Hablar sobre el clima y conversaciones breves",
        "storyNote": "Las conversaciones sobre el clima son el comienzo de toda charla.",
        "paragraphs": [
          {
            "id": "p31-1",
            "translation": "Nubes oscuras se acumulaban sobre los tejados. 'Parece que va a llover', dije. Agarramos nuestros paraguas por si acaso."
          },
          {
            "id": "p31-2",
            "translation": "Abrí la puerta y el frío me golpeó fuerte. 'Hace mucho frío esta mañana', dije. Ella agregó una bufanda antes de salir."
          },
          {
            "id": "p31-3",
            "translation": "Mi amiga se había mudado recientemente a la costa. '¿Cómo está el clima allá?', pregunté. Ella dijo que soleado pero ventoso la mayoría de los días."
          },
          {
            "id": "p31-4",
            "translation": "El aire era denso y pesado al mediodía. 'No aguanto esta humedad', gruñí. Ella rió y me entregó una bebida fría."
          },
          {
            "id": "p31-5",
            "translation": "El pronóstico prometía una tarde despejada. 'Aprovechemos el sol', dije. Empacamos un almuerzo rápido y salimos."
          }
        ]
      },
      "ja": {
        "subtitle": "天気について・スモールトーク",
        "storyNote": "天気の話はすべての会話の始まりです。",
        "paragraphs": [
          {
            "id": "p31-1",
            "translation": "暗い雲が屋根の上に集まっていた。『雨が降りそうですね』と私は言った。念のため傘をつかんだ。"
          },
          {
            "id": "p31-2",
            "translation": "ドアを開けると、冷たい風が私を襲った。『今朝は外が凍えるほど寒いですね』と私は言った。彼女は外に出る前にスカーフを追加した。"
          },
          {
            "id": "p31-3",
            "translation": "友人は最近海岸に引っ越してきた。『そちらの天気はどうですか？』と聞いた。彼女はほとんどの日が晴れているが風が強いと言った。"
          },
          {
            "id": "p31-4",
            "translation": "正午までに空気は厚く重くなっていた。『この湿度は我慢できません』と私はうめいた。彼女は笑って冷たい飲み物をくれた。"
          },
          {
            "id": "p31-5",
            "translation": "天気予報は晴れた午後を約束していた。『日差しを最大限に活かしましょう』と私は言った。軽いお弁当を詰めて出かけた。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "谈论天气·闲聊",
        "storyNote": "天气话题是所有对话的开始。",
        "paragraphs": [
          {
            "id": "p31-1",
            "translation": "乌云聚集在屋顶上方。'看起来要下雨了,'我说道。我们以防万一拿起了伞。"
          },
          {
            "id": "p31-2",
            "translation": "我打开门,寒冷袭击了我。'今天早上外面冷得要死,'我说道。她在走出去之前加上了围巾。"
          },
          {
            "id": "p31-3",
            "translation": "我的朋友刚搬到海边。'那边天气怎么样?'我问道。她说大多数日子都是晴天但有风。"
          },
          {
            "id": "p31-4",
            "translation": "到中午时,空气又厚又闷。'我受不了这种湿度,'我抱怨道。她笑着递给我一杯冷饮。"
          },
          {
            "id": "p31-5",
            "translation": "天气预报预报一个晴朗的下午。'让我们充分利用阳光吧,'我说道。我们快速打包了午餐并出发了。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "談論天氣·閒聊",
        "storyNote": "天氣話題是所有對話的開始。",
        "paragraphs": [
          {
            "id": "p31-1",
            "translation": "烏雲聚集在屋頂上方。'看起來要下雨了,'我說道。我們以防萬一拿起了傘。"
          },
          {
            "id": "p31-2",
            "translation": "我打開門,寒冷襲擊了我。'今天早上外面冷得要死,'我說道。她在走出去之前加上了圍巾。"
          },
          {
            "id": "p31-3",
            "translation": "我的朋友剛搬到海邊。'那邊天氣怎麼樣?'我問道。她說大多數日子都是晴天但有風。"
          },
          {
            "id": "p31-4",
            "translation": "到中午時,空氣又厚又悶。'我受不了這種濕度,'我抱怨道。她笑著遞給我一杯冷飲。"
          },
          {
            "id": "p31-5",
            "translation": "天氣預報預報一個晴朗的下午。'讓我們充分利用陽光吧,'我說道。我們快速打包了午餐並出發了。"
          }
        ]
      },
      "fr": {
        "subtitle": "Parler de la météo et petite conversation",
        "storyNote": "Parler de la météo est le début de toute conversation.",
        "paragraphs": [
          {
            "id": "p31-1",
            "translation": "Des nuages sombres s'accumulaient au-dessus des toits. 'On dirait qu'il va pleuvoir,' ai-je dit. Nous avons attrapé nos parapluies au cas où."
          },
          {
            "id": "p31-2",
            "translation": "J'ai ouvert la porte et le froid m'a frappé durement. 'Il gèle ce matin,' ai-je dit. Elle a ajouté une écharpe avant de sortir."
          },
          {
            "id": "p31-3",
            "translation": "Mon amie venait de s'installer sur la côte. 'Quel temps fait-il là-bas?' ai-je demandé. Elle a dit qu'il faisait beau mais venteux la plupart des jours."
          },
          {
            "id": "p31-4",
            "translation": "L'air était épais et lourd à midi. 'Je ne supporte pas cette humidité,' ai-je grogné. Elle a ri et m'a tendu une boisson froide."
          },
          {
            "id": "p31-5",
            "translation": "La prévision promettait un après-midi dégagé. 'Profitez du soleil,' ai-je dit. Nous avons emballé un déjeuner rapide et sommes partis."
          }
        ]
      },
      "de": {
        "subtitle": "Über das Wetter sprechen und Small Talk",
        "storyNote": "Das Gespräch über das Wetter ist der Beginn jedes Gesprächs.",
        "paragraphs": [
          {
            "id": "p31-1",
            "translation": "Dunkle Wolken sammelten sich über den Dächern. 'Es sieht so aus, als würde es regnen,' sagte ich. Wir schnappten uns sicherheitshalber unsere Regenschirme."
          },
          {
            "id": "p31-2",
            "translation": "Ich öffnete die Tür und die Kälte traf mich hart. 'Es ist heute Morgen eiskalt da draußen,' sagte ich. Sie legte einen Schal an, bevor sie hinausging."
          },
          {
            "id": "p31-3",
            "translation": "Meine Freundin war gerade an die Küste gezogen. 'Wie ist das Wetter dort oben?' fragte ich. Sie sagte, dass es meistens sonnig aber windig war."
          },
          {
            "id": "p31-4",
            "translation": "Die Luft war mittags dick und schwer. 'Ich halte diese Luftfeuchtigkeit nicht aus,' stöhnte ich. Sie lachte und reichte mir ein kaltes Getränk."
          },
          {
            "id": "p31-5",
            "translation": "Die Vorhersage versprach einen klaren Nachmittag. 'Lasst uns das Sonnenlicht optimal nutzen,' sagte ich. Wir packten schnell ein Mittagessen ein und machten uns auf den Weg."
          }
        ]
      }
    }
  },
  {
    "storyId": 32,
    "translations": {
      "es": {
        "subtitle": "El Ejercicio",
        "storyNote": "Nos hacemos amigos naturalmente hablando de ejercicio.",
        "paragraphs": [
          {
            "id": "p32-1",
            "translation": "Nos estiramos uno al lado del otro antes de la clase. \"Ahora hago ejercicio tres veces a la semana\", dije. Ella quedó impresionada y me pidió consejos."
          },
          {
            "id": "p32-2",
            "translation": "Hice una mueca al alcanzar mi bolsa. \"Tengo agujetas del entrenamiento de piernas de ayer\", admití. Ella asintió y dijo que me estirara."
          },
          {
            "id": "p32-3",
            "translation": "El entrenador nos indicó hacia el piso abierto. \"Hagamos calentamiento antes de empezar a correr\", dijo. Trotamos una vuelta lenta para aflojarnos."
          },
          {
            "id": "p32-4",
            "translation": "El nuevo gimnasio había estado en mi mente durante semanas. \"He estado pensando en unirme a un gimnasio\", le dije. Ella se ofreció a acompañarme el lunes."
          },
          {
            "id": "p32-5",
            "translation": "Levantarme a las seis nunca fue fácil. \"Vale la pena despertarse temprano para correr\", dije. Las calles tranquilas hacían que todo fuera mejor."
          }
        ]
      },
      "ja": {
        "subtitle": "運動",
        "storyNote": "運動の話で自然に仲よくなります。",
        "paragraphs": [
          {
            "id": "p32-1",
            "translation": "クラスの前に、私たちは並んでストレッチをしました。「今は週3回運動しているんです」と私は言いました。彼女は感心して、コツを教えてほしいと言いました。"
          },
          {
            "id": "p32-2",
            "translation": "バッグに手を伸ばすとき、私は少し顔をしかめました。「昨日の脚の日のトレーニングで筋肉痛です」と認めました。彼女はうなずいて、ストレッチするといいと言いました。"
          },
          {
            "id": "p32-3",
            "translation": "コーチは私たちをオープンフロアに手で招きました。「走る前にウォームアップをしましょう」と彼は言いました。私たちはほぐすためにゆっくり1周ジョギングしました。"
          },
          {
            "id": "p32-4",
            "translation": "新しいジムのことは何週間も頭の片隅にありました。「ジムに入ろうと思ってるんです」と彼女に言いました。彼女は月曜日に一緒に行くと申し出てくれました。"
          },
          {
            "id": "p32-5",
            "translation": "6時に起きるのはいつも大変でした。「走るために早く起きる価値があります」と私は言いました。静かな通りのおかげで、すべてがもっと良く感じられました。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "锻炼",
        "storyNote": "通过聊天谈论运动自然地拉近彼此的距离。",
        "paragraphs": [
          {
            "id": "p32-1",
            "translation": "课前，我们肩并肩地做起了拉伸运动。\"我现在一周运动三次，\"我说。她印象深刻，问我要诀窍。"
          },
          {
            "id": "p32-2",
            "translation": "我伸手去拿包时皱了皱眉。\"昨天练腿后肌肉酸痛，\"我承认道。她点点头，说要拉伸放松。"
          },
          {
            "id": "p32-3",
            "translation": "教练挥手示意我们走向空旷的地面。\"开始跑步前先热身，\"他说。我们慢速跑了一圈来放松肌肉。"
          },
          {
            "id": "p32-4",
            "translation": "新开的健身房我已经想了好几周。\"我一直想加入健身房，\"我告诉她。她主动提出星期一和我一起去。"
          },
          {
            "id": "p32-5",
            "translation": "六点起床从来都不容易。\"早起跑步是值得的，\"我说。安静的街道让整个过程变得更美好。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "運動",
        "storyNote": "透過聊運動的話題自然地拉近彼此距離。",
        "paragraphs": [
          {
            "id": "p32-1",
            "translation": "上課前，我們肩並肩地做起了拉伸運動。「我現在一週運動三次，」我說。她印象深刻，問我要訣竅。"
          },
          {
            "id": "p32-2",
            "translation": "我伸手去拿包時皺了皺眉。「昨天練腿後肌肉酸痛，」我承認道。她點點頭，說要拉伸放鬆。"
          },
          {
            "id": "p32-3",
            "translation": "教練揮手示意我們走向空曠的地面。「開始跑步前先熱身，」他說。我們慢速跑了一圈來放鬆肌肉。"
          },
          {
            "id": "p32-4",
            "translation": "新開的健身房我已經想了好幾週。「我一直想加入健身房，」我告訴她。她主動提出星期一和我一起去。"
          },
          {
            "id": "p32-5",
            "translation": "六點起床從來都不容易。「早起跑步是值得的，」我說。安靜的街道讓整個過程變得更美好。"
          }
        ]
      },
      "fr": {
        "subtitle": "L'Exercice",
        "storyNote": "On se rapproche naturellement en parlant d'exercice.",
        "paragraphs": [
          {
            "id": "p32-1",
            "translation": "Nous nous sommes étirés côte à côte avant le cours. « Je fais de l'exercice trois fois par semaine maintenant », ai-je dit. Elle a été impressionnée et m'a demandé des conseils."
          },
          {
            "id": "p32-2",
            "translation": "J'ai grimacé en me penchant pour attraper mon sac. « J'ai des courbatures après la séance de jambes d'hier », ai-je avoué. Elle a hoché la tête et m'a dit de m'étirer."
          },
          {
            "id": "p32-3",
            "translation": "L'entraîneur nous a fait signe de nous diriger vers l'espace libre. « Faisons un échauffement avant de commencer à courir », a-t-il dit. Nous avons trotté lentement une tour pour nous détendre."
          },
          {
            "id": "p32-4",
            "translation": "La nouvelle salle de gym me trottait dans la tête depuis des semaines. « Je pensais à m'inscrire à une salle de gym », lui ai-je dit. Elle a proposé de m'accompagner lundi."
          },
          {
            "id": "p32-5",
            "translation": "Me lever à six heures n'a jamais été facile. « Ça en vaut la peine de se lever tôt pour courir », ai-je dit. Les rues tranquilles rendaient tout cela meilleur."
          }
        ]
      },
      "de": {
        "subtitle": "Training",
        "storyNote": "Wir werden natürlich durch das Gespräch über Sport Freunde.",
        "paragraphs": [
          {
            "id": "p32-1",
            "translation": "Wir dehnten uns nebeneinander aus, bevor der Kurs begann. \"Ich trainiere jetzt dreimal pro Woche\", sagte ich. Sie war beeindruckt und fragte mich um Tipps."
          },
          {
            "id": "p32-2",
            "translation": "Ich verzog das Gesicht, als ich nach meiner Tasche griff. \"Meine Muskeln sind vom gestrigen Beintraining wund\", gab ich zu. Sie nickte und sagte mir, dass ich mich dehnen sollte."
          },
          {
            "id": "p32-3",
            "translation": "Der Trainer winkte uns zum freien Bereich. \"Lassen Sie uns aufwärmen, bevor wir mit dem Laufen beginnen\", sagte er. Wir liefen eine langsame Runde, um uns aufzulockern."
          },
          {
            "id": "p32-4",
            "translation": "Das neue Fitnessstudio spukte mir seit Wochen im Kopf herum. \"Ich wollte schon lange einem Fitnessstudio beitreten\", sagte ich ihr. Sie bot an, mich am Montag zu begleiten."
          },
          {
            "id": "p32-5",
            "translation": "Um sechs Uhr aufzustehen war nie einfach. \"Es lohnt sich, früh aufzustehen um zu laufen\", sagte ich. Die ruhigen Straßen machten das Ganze besser."
          }
        ]
      }
    }
  },
  {
    "storyId": 33,
    "translations": {
      "es": {
        "subtitle": "Pasatiempo",
        "storyNote": "El inglés cobra vida cuando hablas de lo que te gusta.",
        "paragraphs": [
          {
            "id": "p33-1",
            "translation": "Le mostré las fotos de mi fin de semana. 'Últimamente estoy muy metido en la fotografía analógica', dije. Ella quiso ver mis fotos favoritas."
          },
          {
            "id": "p33-2",
            "translation": "Una guitarra vieja estaba apoyada en la esquina de la sala. 'Siempre he querido aprender a tocar guitarra', admití. Ella dijo que nunca es demasiado tarde para empezar."
          },
          {
            "id": "p33-3",
            "translation": "Ella me pasó el cuaderno de dibujo con una sonrisa. 'No soy muy bueno dibujando', reí. Aun así, lo intenté de verdad."
          },
          {
            "id": "p33-4",
            "translation": "Después de una semana larga, cogí mis pinturas. 'Pintar me ayuda a relajarme después del trabajo', dije. Ella lo entendió completamente y se unió a mí."
          },
          {
            "id": "p33-5",
            "translation": "La cocina olía a pan fresco todo el invierno. 'Empecé a hornear durante las vacaciones', le conté. Ella me pidió que le llevara algo la próxima vez."
          }
        ]
      },
      "ja": {
        "subtitle": "趣味",
        "storyNote": "好きなことについて話すと、英語が生き生きとしてきます。",
        "paragraphs": [
          {
            "id": "p33-1",
            "translation": "週末の写真を彼女に見せた。「最近フィルム写真にハマっているんだ」と言った。彼女は僕のお気に入りの写真を見たがった。"
          },
          {
            "id": "p33-2",
            "translation": "部屋の隅に古いギターが立てかけてあった。「昔からギターを弾きたかった」と認めた。彼女は始めるのに遅すぎることはないと言った。"
          },
          {
            "id": "p33-3",
            "translation": "彼女はスケッチブックを笑顔で僕に渡した。「僕は絵が得意じゃない」と笑った。それでも本気で挑戦してみた。"
          },
          {
            "id": "p33-4",
            "translation": "長い一週間の後、僕は絵の具に手を伸ばした。「仕事の後は絵を描くとリラックスできるんだ」と言った。彼女は完全に理解して、一緒に描き始めた。"
          },
          {
            "id": "p33-5",
            "translation": "冬中、キッチンは焼きたてのパンの香りに満ちていた。「休暇中にお菓子作りを始めたんだ」と彼女に言った。彼女は次はぜひ持ってくるように頼んだ。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "爱好",
        "storyNote": "当你谈论自己喜欢的东西时，英语就生动起来了。",
        "paragraphs": [
          {
            "id": "p33-1",
            "translation": "我给她看了我周末拍的照片。'我最近特别迷胶卷摄影'，我说。她想看我最喜欢的几张照片。"
          },
          {
            "id": "p33-2",
            "translation": "一把旧吉他斜靠在房间的角落里。'我一直想学吉他'，我坦白道。她说永远不会太晚。"
          },
          {
            "id": "p33-3",
            "translation": "她笑着递给我素描本。'我画得不太好'，我笑着说。尽管如此，我还是认真地试了一下。"
          },
          {
            "id": "p33-4",
            "translation": "经过漫长的一周，我拿起了颜料。'绘画能帮我放松工作后的疲劳'，我说。她完全理解，也加入了我。"
          },
          {
            "id": "p33-5",
            "translation": "整个冬天，厨房里都飘着新鲜面包的香味。'我在假期里学会了烘焙'，我告诉她。她央求我下次一定要带一些来。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "興趣",
        "storyNote": "當你談論自己喜歡的東西時，英語就生動起來了。",
        "paragraphs": [
          {
            "id": "p33-1",
            "translation": "我給她看了我週末拍的照片。'我最近特別迷膠卷攝影'，我說。她想看我最喜歡的幾張照片。"
          },
          {
            "id": "p33-2",
            "translation": "一把舊吉他斜靠在房間的角落裡。'我一直想學吉他'，我坦白道。她說永遠不會太晚。"
          },
          {
            "id": "p33-3",
            "translation": "她笑著遞給我素描本。'我畫得不太好'，我笑著說。儘管如此，我還是認真地試了一下。"
          },
          {
            "id": "p33-4",
            "translation": "經過漫長的一週，我拿起了顏料。'繪畫能幫我放鬆工作後的疲勞'，我說。她完全理解，也加入了我。"
          },
          {
            "id": "p33-5",
            "translation": "整個冬天，廚房裡都飄著新鮮麵包的香味。'我在假期裡學會了烘焙'，我告訴她。她央求我下次一定要帶一些來。"
          }
        ]
      },
      "fr": {
        "subtitle": "Loisir",
        "storyNote": "L'anglais prend vie quand vous parlez de ce que vous aimez.",
        "paragraphs": [
          {
            "id": "p33-1",
            "translation": "Je lui ai montré les photos de mon week-end. 'Je suis vraiment passionné par la photographie argentique en ce moment', ai-je dit. Elle voulait voir mes clichés préférés."
          },
          {
            "id": "p33-2",
            "translation": "Une vieille guitare était appuyée dans le coin de la pièce. 'J'ai toujours voulu apprendre la guitare', ai-je avoué. Elle a dit qu'il n'est jamais trop tard pour commencer."
          },
          {
            "id": "p33-3",
            "translation": "Elle m'a passé le carnet de croquis avec un sourire. 'Je ne suis pas très doué pour le dessin', ai-je ri. Malgré tout, j'ai vraiment essayé."
          },
          {
            "id": "p33-4",
            "translation": "Après une longue semaine, j'ai pris mes pinceaux. 'La peinture m'aide à me détendre après le travail', ai-je dit. Elle a complètement compris et m'a rejoint."
          },
          {
            "id": "p33-5",
            "translation": "La cuisine sentait le pain frais tout l'hiver. 'J'ai commencé la pâtisserie pendant les vacances', lui ai-je dit. Elle m'a suppliée d'en apporter la prochaine fois."
          }
        ]
      },
      "de": {
        "subtitle": "Hobby",
        "storyNote": "Englisch wird lebendig, wenn du über deine Lieblingsbeschäftigungen sprichst.",
        "paragraphs": [
          {
            "id": "p33-1",
            "translation": "Ich zeigte ihr die Fotos von meinem Wochenende. 'Ich interessiere mich gerade sehr für Analogfotografie', sagte ich. Sie wollte meine Lieblingsaufnahmen sehen."
          },
          {
            "id": "p33-2",
            "translation": "Eine alte Gitarre lehnte an der Ecke des Zimmers. 'Ich wollte schon immer Gitarre spielen lernen', gab ich zu. Sie sagte, es ist nie zu spät, anzufangen."
          },
          {
            "id": "p33-3",
            "translation": "Sie reichte mir das Skizzenbuch mit einem Lächeln. 'Ich bin nicht sehr gut im Zeichnen', lachte ich. Trotzdem versuchte ich es wirklich."
          },
          {
            "id": "p33-4",
            "translation": "Nach einer langen Woche griff ich nach meinen Farben. 'Malen hilft mir, nach der Arbeit zu entspannen', sagte ich. Sie verstand das vollkommen und machte mit."
          },
          {
            "id": "p33-5",
            "translation": "Die Küche roch den ganzen Winter über nach frischem Brot. 'Ich habe über die Feiertage mit Backen angefangen', erzählte ich ihr. Sie bat mich, das nächste Mal etwas mitzubringen."
          }
        ]
      }
    }
  },
  {
    "storyId": 34,
    "translations": {
      "es": {
        "subtitle": "Tareas del hogar",
        "storyNote": "Las frases sobre tareas del hogar son inglés de la vida real.",
        "paragraphs": [
          {
            "id": "p34-1",
            "translation": "El fregadero estaba lleno y nadie se había movido. Le recordé: Es tu turno de lavar los platos. Gruñó pero se remangó."
          },
          {
            "id": "p34-2",
            "translation": "La cesta de ropa estaba demasiado llena. Le pregunté: ¿Puedes ayudarme con la ropa? Él dobló mientras yo clasificaba los calcetines."
          },
          {
            "id": "p34-3",
            "translation": "Ya estaba a mitad de camino hacia la puerta. Llamé: No olvides sacar la basura. Se dio la vuelta y agarró la bolsa."
          },
          {
            "id": "p34-4",
            "translation": "Abrí la puerta y suspiré al verlo. Dije: La cocina es un desastre total. Lo dividimos y lo limpiamos en veinte minutos."
          },
          {
            "id": "p34-5",
            "translation": "Me dejé caer en el sofá, finalmente terminada. Dije: Acabo de terminar de pasar la aspiradora por todo el lugar. Él me entregó una bebida fría como recompensa."
          }
        ]
      },
      "ja": {
        "subtitle": "家事",
        "storyNote": "家事についてのフレーズは本当の日常英語です。",
        "paragraphs": [
          {
            "id": "p34-1",
            "translation": "シンクは満杯で、誰も動いていませんでした。彼に思い出させました。お皿を洗うのはあなたの番です。彼はうめきましたが、袖をまくりました。"
          },
          {
            "id": "p34-2",
            "translation": "洗濯かごはいっぱいでした。彼に聞きました。洗濯を手伝ってくれませんか。彼は折りたたんで、私は靴下を分類しました。"
          },
          {
            "id": "p34-3",
            "translation": "彼はすでにドアの途中にいました。呼び出しました。ゴミを出すのを忘れないでください。彼は向き直ってバッグをつかみました。"
          },
          {
            "id": "p34-4",
            "translation": "ドアを開けてため息をつきました。言いました。キッチンは本当にめちゃくちゃです。それを分割して20分で掃除しました。"
          },
          {
            "id": "p34-5",
            "translation": "やっと終わったのでソファに倒れました。言いました。やっと全体を掃除機をかけ終わりました。彼はご褒美として冷たい飲み物をくれました。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "家务",
        "storyNote": "关于家务的短语是真实生活中的英语。",
        "paragraphs": [
          {
            "id": "p34-1",
            "translation": "水槽里装满了，没有人动过。我提醒他：轮到你洗碗了。他呻吟着，但卷起了袖子。"
          },
          {
            "id": "p34-2",
            "translation": "洗衣篮太满了。我问他：你能帮我洗衣服吗？他折叠衣服，我整理袜子。"
          },
          {
            "id": "p34-3",
            "translation": "他已经走到门口了。我叫住他：别忘了倒垃圾。他转身拿起了袋子。"
          },
          {
            "id": "p34-4",
            "translation": "我打开门，看到一团糟叹了口气。我说：厨房乱得要命。我们分工合作，二十分钟就打扫干净了。"
          },
          {
            "id": "p34-5",
            "translation": "我终于完成了，倒在沙发上。我说：我刚吸完了整个地方。他递给我一杯冷饮作为奖励。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "家務",
        "storyNote": "關於家務的短語是真實生活中的英語。",
        "paragraphs": [
          {
            "id": "p34-1",
            "translation": "水槽裡裝滿了，沒有人動過。我提醒他：輪到你洗碗了。他呻吟著，但捲起了袖子。"
          },
          {
            "id": "p34-2",
            "translation": "洗衣籃太滿了。我問他：你能幫我洗衣服嗎？他折疊衣服，我整理襪子。"
          },
          {
            "id": "p34-3",
            "translation": "他已經走到門口了。我叫住他：別忘了倒垃圾。他轉身拿起了袋子。"
          },
          {
            "id": "p34-4",
            "translation": "我打開門，看到一團糟嘆了口氣。我說：廚房亂得要命。我們分工合作，二十分鐘就打掃乾淨了。"
          },
          {
            "id": "p34-5",
            "translation": "我終於完成了，倒在沙發上。我說：我剛吸完了整個地方。他遞給我一杯冷飲作為獎勵。"
          }
        ]
      },
      "fr": {
        "subtitle": "Les tâches ménagères",
        "storyNote": "Les phrases sur les tâches ménagères sont du vrai anglais de la vie quotidienne.",
        "paragraphs": [
          {
            "id": "p34-1",
            "translation": "L'évier était plein et personne n'avait bougé. Je lui ai rappelé : C'est à ton tour de faire la vaisselle. Il a gémi mais s'est retroussé les manches."
          },
          {
            "id": "p34-2",
            "translation": "Le panier à linge était bien trop plein. Je lui ai demandé : Tu peux m'aider avec la lessive ? Il pliait pendant que je triaient les chaussettes."
          },
          {
            "id": "p34-3",
            "translation": "Il était déjà à moitié par la porte. J'ai appelé : N'oublie pas de sortir les poubelles. Il s'est retourné et a attrapé le sac."
          },
          {
            "id": "p34-4",
            "translation": "J'ai ouvert la porte et j'ai soupiré à la vue. J'ai dit : La cuisine est un vrai désastre. On l'a partagé et nettoyé en vingt minutes."
          },
          {
            "id": "p34-5",
            "translation": "Je me suis effondrée sur le canapé, enfin terminée. J'ai dit : Je viens de finir de passer l'aspirateur partout. Il m'a tendu une boisson froide en récompense."
          }
        ]
      },
      "de": {
        "subtitle": "Hausarbeit",
        "storyNote": "Sätze über Hausarbeit sind echtes Englisch aus dem Alltag.",
        "paragraphs": [
          {
            "id": "p34-1",
            "translation": "Das Spülbecken war voll und niemand hatte sich gerührt. Ich erinnerte ihn: Es ist deine Reihe, das Geschirr zu spülen. Er stöhnte auf, aber krempelte die Ärmel hoch."
          },
          {
            "id": "p34-2",
            "translation": "Der Wäschekorb war viel zu voll. Ich fragte ihn: Kannst du mir mit der Wäsche helfen? Er faltete, während ich die Socken sortierte."
          },
          {
            "id": "p34-3",
            "translation": "Er war bereits halb zur Tür hinaus. Ich rief: Vergiss nicht, den Müll rausbringen! Er drehte sich um und schnappte sich die Tasche."
          },
          {
            "id": "p34-4",
            "translation": "Ich öffnete die Tür und seufzte beim Anblick. Ich sagte: Die Küche ist ein totales Chaos. Wir teilten uns die Arbeit auf und räumten es in zwanzig Minuten auf."
          },
          {
            "id": "p34-5",
            "translation": "Ich fiel auf die Couch, endlich fertig. Ich sagte: Ich habe gerade den ganzen Platz gesaugt. Er reichte mir ein kaltes Getränk als Belohnung."
          }
        ]
      }
    }
  },
  {
    "storyId": 35,
    "translations": {
      "es": {
        "subtitle": "Crianza",
        "storyNote": "Una palabra cariñosa que digo cada día a mi hijo.",
        "paragraphs": [
          {
            "id": "p35-1",
            "translation": "El reloj marcó las ocho y los juguetes aún cubrían el piso. 'Es hora de prepararse para dormir', dije suavemente. Ella bostezó y extendió la mano hacia su osito."
          },
          {
            "id": "p35-2",
            "translation": "Se subió a la cama con una sonrisa soñolienta. '¿Ya te cepillaste los dientes?', pregunté. Ella asintió y me mostró su sonrisa con sabor a menta."
          },
          {
            "id": "p35-3",
            "translation": "Saltó hacia las escaleras en sus calcetines. 'Ten cuidado de no resbalar en los escalones', le advertí. Ella desaceleró y se aferró a la barandilla."
          },
          {
            "id": "p35-4",
            "translation": "Ella alineó sus zapatos junto a la puerta completamente sola. 'Buen trabajo guardando tus zapatos', dije. Su cara entera se iluminó de orgullo."
          },
          {
            "id": "p35-5",
            "translation": "Su hermano menor extendió la mano hacia el mismo juguete. 'Necesitas compartir con tu hermano', dije suavemente. Ella lo pensó y luego se lo pasó."
          }
        ]
      },
      "ja": {
        "subtitle": "育児",
        "storyNote": "子どもに毎日かける優しい一言。",
        "paragraphs": [
          {
            "id": "p35-1",
            "translation": "時計は8時を過ぎ、おもちゃはまだ床を覆っていた。『寝る準備をする時間だよ』と優しく言った。彼女はあくびをしてクマのぬいぐるみに手を伸ばした。"
          },
          {
            "id": "p35-2",
            "translation": "彼女は眠そうな笑みを浮かべてベッドに登った。『もう歯を磨いたの？』と聞いた。彼女はうなずいてミント色の笑顔を見せてくれた。"
          },
          {
            "id": "p35-3",
            "translation": "彼女は靴下を履いて階段に向かって跳ねた。『段差で滑らないように気をつけてね』と注意した。彼女はペースを落として手すりをつかんだ。"
          },
          {
            "id": "p35-4",
            "translation": "彼女は自分だけで靴をドアの近くに並べた。『靴をしまってくれてありがとう』と言った。彼女の顔全体が誇りで輝いた。"
          },
          {
            "id": "p35-5",
            "translation": "彼女の弟は同じおもちゃに手を伸ばした。『お兄さんとシェアする必要があるよ』と優しく言った。彼女はそれを考えてから、おもちゃを渡した。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "育儿",
        "storyNote": "每天对孩子说的温柔话语。",
        "paragraphs": [
          {
            "id": "p35-1",
            "translation": "时钟指过了八点，玩具仍然铺满了地板。'该准备睡觉了'，我轻声说。她打了个哈欠，伸手拿起了她的熊玩偶。"
          },
          {
            "id": "p35-2",
            "translation": "她带着睡意朦胧的微笑爬上了床。'你已经刷牙了吗？'我问道。她点了点头，向我展示了她薄荷味的笑容。"
          },
          {
            "id": "p35-3",
            "translation": "她穿着袜子朝楼梯蹦跳而去。'小心不要在台阶上滑倒'，我警告道。她放慢了速度，抓住了扶手。"
          },
          {
            "id": "p35-4",
            "translation": "她自己一个人把鞋子整齐地排列在门边。'你很好地收好了你的鞋子'，我说。她的整张脸都闪闪发光，洋溢着骄傲。"
          },
          {
            "id": "p35-5",
            "translation": "她的弟弟伸手去拿同一个玩具。'你需要和你的弟弟分享'，我轻声说。她考虑了一下，然后把玩具递给了他。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "育兒",
        "storyNote": "每天對孩子說的溫柔話語。",
        "paragraphs": [
          {
            "id": "p35-1",
            "translation": "時鐘指過了八點，玩具仍然鋪滿了地板。'該準備睡覺了'，我輕聲說。她打了個哈欠，伸手拿起了她的熊玩偶。"
          },
          {
            "id": "p35-2",
            "translation": "她帶著睡意朦朧的微笑爬上了床。'你已經刷牙了嗎？'我問道。她點了點頭，向我展示了她薄荷味的笑容。"
          },
          {
            "id": "p35-3",
            "translation": "她穿著襪子朝樓梯蹦跳而去。'小心不要在台階上滑倒'，我警告道。她放慢了速度，抓住了扶手。"
          },
          {
            "id": "p35-4",
            "translation": "她自己一個人把鞋子整齊地排列在門邊。'你很好地收好了你的鞋子'，我說。她的整張臉都閃閃發光，洋溢著驕傲。"
          },
          {
            "id": "p35-5",
            "translation": "她的弟弟伸手去拿同一個玩具。'你需要和你的弟弟分享'，我輕聲說。她考慮了一下，然後把玩具遞給了他。"
          }
        ]
      },
      "fr": {
        "subtitle": "Parentalité",
        "storyNote": "Une parole douce que je dis à mon enfant chaque jour.",
        "paragraphs": [
          {
            "id": "p35-1",
            "translation": "L'horloge a dépassé huit heures et les jouets couvraient toujours le sol. 'Il est temps de te préparer pour dormir', ai-je dit doucement. Elle a bâillé et a tendu la main vers son ourson."
          },
          {
            "id": "p35-2",
            "translation": "Elle s'est montée dans le lit avec un sourire endormi. 'Tu as déjà brossé tes dents ?', ai-je demandé. Elle a hoché la tête et m'a montré son sourire à la menthe."
          },
          {
            "id": "p35-3",
            "translation": "Elle a sauté vers l'escalier en chaussettes. 'Fais attention à ne pas glisser sur les marches', l'ai-je avertie. Elle a ralenti et a tenu la rampe."
          },
          {
            "id": "p35-4",
            "translation": "Elle a rangé ses chaussures près de la porte toute seule. 'Bien joué de ranger tes chaussures', ai-je dit. Tout son visage s'est illuminé de fierté."
          },
          {
            "id": "p35-5",
            "translation": "Son petit frère a tendu la main vers le même jouet. 'Tu dois partager avec ton frère', ai-je dit gentiment. Elle y a réfléchi, puis le lui a donné."
          }
        ]
      },
      "de": {
        "subtitle": "Kindererziehung",
        "storyNote": "Ein liebevolles Wort, das ich meinem Kind jeden Tag sage.",
        "paragraphs": [
          {
            "id": "p35-1",
            "translation": "Die Uhr war über acht Uhr vorbeigegangen und Spielzeug bedeckte immer noch den Boden. 'Es ist Zeit, sich zum Schlafengehen fertig zu machen', sagte ich sanft. Sie gähnte und griff nach ihrem Teddybär."
          },
          {
            "id": "p35-2",
            "translation": "Sie kletterte mit einem verschlafenen Lächeln ins Bett. 'Hast du deine Zähne schon geputzt?', fragte ich. Sie nickte und zeigte mir ihr Minz-Lächeln."
          },
          {
            "id": "p35-3",
            "translation": "Sie hüpfte in Socken zur Treppe. 'Pass auf, dass du nicht auf den Stufen ausrutschst', warnte ich. Sie verlangsamte ihr Tempo und hielt sich am Geländer fest."
          },
          {
            "id": "p35-4",
            "translation": "Sie stellte ihre Schuhe ganz von selbst neben die Tür. 'Gut gemacht, dass du deine Schuhe weggeräumt hast', sagte ich. Ihr ganzes Gesicht leuchtete vor Stolz."
          },
          {
            "id": "p35-5",
            "translation": "Ihr kleiner Bruder griff nach demselben Spielzeug. 'Du musst mit deinem Bruder teilen', sagte ich sanft. Sie überlegte kurz und gab es ihm dann."
          }
        ]
      }
    }
  },
  {
    "storyId": 36,
    "translations": {
      "es": {
        "subtitle": "Escuela y clase",
        "storyNote": "El lenguaje de quienes aprenden, inglés de campus.",
        "paragraphs": [
          {
            "id": "p36-1",
            "translation": "Comparamos horarios el primer día. \"Estoy estudiando informática\", dije. Ella sonrió y dijo que compartíamos una clase."
          },
          {
            "id": "p36-2",
            "translation": "Miré fijamente el libro de texto hasta que las palabras se borraron. \"No entiendo esta parte en absoluto\", admití. Ella me lo explicó paso a paso."
          },
          {
            "id": "p36-3",
            "translation": "El profesor escribió la fecha en la pizarra con rojo. \"El ensayo vence el viernes\", murmuré. Acordamos empezarlo esa noche."
          },
          {
            "id": "p36-4",
            "translation": "La clase terminó y ambos nos veíamos con hambre. \"¿Quieres almorzar después?\", pregunté. Ella dijo que sí si podíamos probar el lugar nuevo."
          },
          {
            "id": "p36-5",
            "translation": "Mi escritorio estaba cubierto de notas adhesivas. \"Esta semana estoy atrasado en las lecturas\", suspiré. Ella se ofreció a compartir sus apuntes."
          }
        ]
      },
      "ja": {
        "subtitle": "学校と授業",
        "storyNote": "学ぶ者の言葉、キャンパス英語。",
        "paragraphs": [
          {
            "id": "p36-1",
            "translation": "初日にスケジュールを比べた。「コンピュータサイエンスを専攻しています」と私は言った。彼女は顔を輝かせて、同じクラスを取っていると言った。"
          },
          {
            "id": "p36-2",
            "translation": "言葉がぼやけるまで教科書をじっと見つめた。「この部分が全然わかりません」と私は認めた。彼女はそれをステップバイステップで説明してくれた。"
          },
          {
            "id": "p36-3",
            "translation": "教授は赤でボードに日付を書いた。「エッセイは金曜日が期限です」とつぶやいた。その夜に始めることに同意した。"
          },
          {
            "id": "p36-4",
            "translation": "授業が終わり、二人とも空腹に見えた。「この後、ランチに行きませんか？」と聞いた。彼女は新しい場所を試せるなら行くと言った。"
          },
          {
            "id": "p36-5",
            "translation": "私の机は付箋だらけだった。「今週は読書が遅れています」とため息をついた。彼女はノートを共有することを申し出た。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "学校和课堂",
        "storyNote": "学习者的语言，校园英语。",
        "paragraphs": [
          {
            "id": "p36-1",
            "translation": "第一天我们比较了课程表。\"我主修计算机科学，\"我说。她眼睛一亮，说我们有一堂课一起上。"
          },
          {
            "id": "p36-2",
            "translation": "我直盯着教科书，直到字迹模糊。\"我完全不懂这部分，\"我承认道。她一步步为我讲解。"
          },
          {
            "id": "p36-3",
            "translation": "教授用红笔在黑板上写下日期。\"论文周五截止，\"我喃喃自语。我们同意那晚就开始写。"
          },
          {
            "id": "p36-4",
            "translation": "下课了，我们都看起来很饿。\"之后一起去吃午餐吗？\"我问。她说如果能去那家新餐厅就行。"
          },
          {
            "id": "p36-5",
            "translation": "我的书桌被便签纸淹没了。\"这周的阅读我落下了，\"我叹气说。她主动提出要分享她的笔记。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "學校和課堂",
        "storyNote": "學習者的語言，校園英語。",
        "paragraphs": [
          {
            "id": "p36-1",
            "translation": "第一天我們比較了課程表。\"我主修電腦科學，\"我說。她眼睛一亮，說我們有一堂課一起上。"
          },
          {
            "id": "p36-2",
            "translation": "我直盯著教科書，直到字跡模糊。\"我完全不懂這部分，\"我承認道。她一步步為我講解。"
          },
          {
            "id": "p36-3",
            "translation": "教授用紅筆在黑板上寫下日期。\"論文週五截止，\"我喃喃自語。我們同意那晚就開始寫。"
          },
          {
            "id": "p36-4",
            "translation": "下課了，我們都看起來很餓。\"之後一起去吃午餐嗎？\"我問。她說如果能去那家新餐廳就行。"
          },
          {
            "id": "p36-5",
            "translation": "我的書桌被便籤紙淹沒了。\"這週的閱讀我落下了，\"我嘆氣說。她主動提出要分享她的筆記。"
          }
        ]
      },
      "fr": {
        "subtitle": "École et classe",
        "storyNote": "Le langage de ceux qui apprennent, l'anglais du campus.",
        "paragraphs": [
          {
            "id": "p36-1",
            "translation": "Nous avons comparé nos emplois du temps le premier jour. « Je suis spécialisée en informatique », ai-je dit. Elle s'est illuminée et a dit que nous partagions un cours."
          },
          {
            "id": "p36-2",
            "translation": "J'ai fixé le manuel jusqu'à ce que les mots se brouillent. « Je ne comprends absolument pas cette partie », ai-je admis. Elle m'a tout expliqué étape par étape."
          },
          {
            "id": "p36-3",
            "translation": "Le professeur a écrit la date au tableau en rouge. « L'essai est dû vendredi », ai-je marmonné. Nous avons convenu de le commencer ce soir-là."
          },
          {
            "id": "p36-4",
            "translation": "Le cours a fini et nous avions tous deux l'air affamées. « Tu veux déjeuner après ? », ai-je demandé. Elle a dit oui si nous pouvions essayer le nouvel endroit."
          },
          {
            "id": "p36-5",
            "translation": "Mon bureau était couvert de post-it. « Je suis en retard dans mes lectures cette semaine », ai-je soupiré. Elle a proposé de partager ses notes."
          }
        ]
      },
      "de": {
        "subtitle": "Schule und Unterricht",
        "storyNote": "Die Sprache der Lernenden, Campus-Englisch.",
        "paragraphs": [
          {
            "id": "p36-1",
            "translation": "Wir verglichen unsere Stundenpläne am ersten Tag. \"Ich studiere Informatik\", sagte ich. Ihr Gesicht leuchtete auf und sie sagte, dass wir einen Kurs zusammen hatten."
          },
          {
            "id": "p36-2",
            "translation": "Ich starrte auf das Lehrbuch, bis die Wörter verschwammen. \"Ich verstehe diesen Teil überhaupt nicht\", gab ich zu. Sie erklärte mir alles Schritt für Schritt."
          },
          {
            "id": "p36-3",
            "translation": "Der Professor schrieb das Datum in Rot an die Tafel. \"Der Essay ist bis Freitag fällig\", murmelte ich. Wir einigten uns darauf, ihn an diesem Abend zu beginnen."
          },
          {
            "id": "p36-4",
            "translation": "Die Stunde endete und wir sahen beide hungrig aus. \"Möchtest du nach der Stunde Mittagessen gehen?\", fragte ich. Sie sagte ja, wenn wir das neue Lokal ausprobieren könnten."
          },
          {
            "id": "p36-5",
            "translation": "Mein Schreibtisch war mit Haftnotizen bedeckt. \"Ich bin diese Woche mit meinen Lesestoffaufgaben im Rückstand\", seufzte ich. Sie bot an, mir ihre Notizen zu teilen."
          }
        ]
      }
    }
  },
  {
    "storyId": 37,
    "translations": {
      "es": {
        "subtitle": "Por teléfono",
        "storyNote": "Inglés telefónico que funciona sin ver la cara.",
        "paragraphs": [
          {
            "id": "p37-1",
            "translation": "La línea se conectó después de dos timbres. Pregunté: ¿Puedo hablar con el gerente, por favor? Me pasaron de inmediato."
          },
          {
            "id": "p37-2",
            "translation": "La señal se cortó un segundo en el centro. Pregunté: ¿Puedes oírme bien ahora? Dijo que estaba claro de nuevo."
          },
          {
            "id": "p37-3",
            "translation": "Vi tres notificaciones cuando miré hacia abajo. Dije: Disculpa, perdí tu llamada anterior. Él se rió y dijo que no había problema."
          },
          {
            "id": "p37-4",
            "translation": "Su voz entraba y salía como una radio defectuosa. Dije: Disculpa, te estás cortando un poco. Me acerqué a la ventana para mejorar la señal."
          },
          {
            "id": "p37-5",
            "translation": "Alguien tocó justo cuando empezamos a hablar. Dije: Espera un segundo, alguien está en la puerta. Volví a la línea en un instante."
          }
        ]
      },
      "ja": {
        "subtitle": "電話で",
        "storyNote": "顔が見えなくても通じる電話英語。",
        "paragraphs": [
          {
            "id": "p37-1",
            "translation": "2回の呼び出しの後、電話が繋がりました。マネージャーと話したいのですが、と尋ねました。すぐに繋いでくれました。"
          },
          {
            "id": "p37-2",
            "translation": "ダウンタウンで信号が1秒落ちました。今は聞こえますか、と尋ねました。彼女は今度は明確だと言いました。"
          },
          {
            "id": "p37-3",
            "translation": "下を見ると3つの通知がありました。申し訳ありませんが、さっきの電話を見逃しました、と言いました。彼は笑って、問題ないと言いました。"
          },
          {
            "id": "p37-4",
            "translation": "彼女の声は悪いラジオのように途切れたり繋がったりしていました。申し訳ありませんが、少し音が途切れています、と言いました。信号をキャッチするため、窓の近くに移動しました。"
          },
          {
            "id": "p37-5",
            "translation": "話し始めた直後、誰かがドアをノックしました。ちょっと待ってください、誰かがドアの前にいます、と言いました。すぐに電話に戻りました。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "在电话上",
        "storyNote": "看不到对方也能通话的电话英语。",
        "paragraphs": [
          {
            "id": "p37-1",
            "translation": "电话在第二声响铃后被接听了。我问：请问能和经理通话吗？他们立即把我转接过去了。"
          },
          {
            "id": "p37-2",
            "translation": "信号在市中心掉线了一秒。我问：现在能听清楚吗？她说信号已经恢复清晰了。"
          },
          {
            "id": "p37-3",
            "translation": "我低头看时看到了三个通知。我说：对不起，我之前错过了你的来电。他笑着说一点问题都没有。"
          },
          {
            "id": "p37-4",
            "translation": "她的声音时断时续，就像坏掉的收音机一样。我说：对不起，你的声音有点断断续续。我走近窗边以获得更好的信号。"
          },
          {
            "id": "p37-5",
            "translation": "我们刚开始通话时有人敲门。我说：稍等一下，有人在门边。我很快就回到了电话线上。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "在電話上",
        "storyNote": "看不到對方也能通話的電話英語。",
        "paragraphs": [
          {
            "id": "p37-1",
            "translation": "電話在第二聲鈴聲後被接聽了。我問：請問能和經理通話嗎？他們立即把我轉接過去了。"
          },
          {
            "id": "p37-2",
            "translation": "信號在市中心掉線了一秒。我問：現在能聽清楚嗎？她說信號已經恢復清晰了。"
          },
          {
            "id": "p37-3",
            "translation": "我低頭看時看到了三個通知。我說：對不起，我之前錯過了你的來電。他笑著說一點問題都沒有。"
          },
          {
            "id": "p37-4",
            "translation": "她的聲音時斷時續，就像壞掉的收音機一樣。我說：對不起，你的聲音有點斷斷續續。我走近窗邊以獲得更好的信號。"
          },
          {
            "id": "p37-5",
            "translation": "我們剛開始通話時有人敲門。我說：稍等一下，有人在門邊。我很快就回到了電話線上。"
          }
        ]
      },
      "fr": {
        "subtitle": "Au téléphone",
        "storyNote": "L'anglais téléphonique qui fonctionne sans voir le visage.",
        "paragraphs": [
          {
            "id": "p37-1",
            "translation": "La ligne a été prise après deux sonneries. J'ai demandé : Puis-je parler au directeur, s'il vous plaît ? Ils m'ont mis en relation immédiatement."
          },
          {
            "id": "p37-2",
            "translation": "Le signal a chuté une seconde au centre-ville. J'ai demandé : Tu m'entends bien maintenant ? Elle a dit que c'était clair à nouveau."
          },
          {
            "id": "p37-3",
            "translation": "J'ai vu trois notifications en baissant les yeux. J'ai dit : Désolé, j'ai raté ton appel plus tôt. Il a ri et a dit que ce n'était pas grave."
          },
          {
            "id": "p37-4",
            "translation": "Sa voix entrait et sortait comme une mauvaise radio. J'ai dit : Désolé, tu te coupe un peu. Je me suis rapproché de la fenêtre pour avoir du signal."
          },
          {
            "id": "p37-5",
            "translation": "Quelqu'un a frappé juste au moment où nous avons commencé à parler. J'ai dit : Attends une seconde, quelqu'un est à la porte. Je suis revenu en ligne tout de suite."
          }
        ]
      },
      "de": {
        "subtitle": "Am Telefon",
        "storyNote": "Telefon-Englisch, das funktioniert, ohne sich das Gesicht anzusehen.",
        "paragraphs": [
          {
            "id": "p37-1",
            "translation": "Die Leitung wurde nach zwei Klingeln abgenommen. Ich fragte: Kann ich bitte mit dem Manager sprechen? Sie stellten mich sofort durch."
          },
          {
            "id": "p37-2",
            "translation": "Das Signal fiel für eine Sekunde in der Innenstadt aus. Ich fragte: Hörst du mich jetzt gut? Sie sagte, es war wieder klar."
          },
          {
            "id": "p37-3",
            "translation": "Ich sah drei Benachrichtigungen, als ich nach unten schaute. Ich sagte: Entschuldigung, ich habe deinen Anruf vorhin verpasst. Er lachte und sagte, kein Problem."
          },
          {
            "id": "p37-4",
            "translation": "Ihre Stimme kam und ging wie ein defektes Radio. Ich sagte: Entschuldigung, du brichst ein bisschen ab. Ich rückte näher zum Fenster, um Signal zu bekommen."
          },
          {
            "id": "p37-5",
            "translation": "Es klopfte gerade, als wir anfingen zu sprechen. Ich sagte: Warte eine Sekunde, jemand ist an der Tür. Ich war sofort wieder in der Leitung."
          }
        ]
      }
    }
  },
  {
    "storyId": 38,
    "translations": {
      "es": {
        "subtitle": "Reuniones y Presentaciones",
        "storyNote": "Hablar con confianza en la sala de reuniones.",
        "paragraphs": [
          {
            "id": "p38-1",
            "translation": "La gente se acomodó en sus asientos con café. \"Comencemos, todos\", dije. La sala se quedó en silencio y las diapositivas aparecieron."
          },
          {
            "id": "p38-2",
            "translation": "Hice clic en la siguiente diapositiva con un gesto. \"Pasemos al presupuesto\", dije. Algunas personas se inclinaron para mirar más de cerca."
          },
          {
            "id": "p38-3",
            "translation": "Llegué a la diapositiva final y hice una pausa. \"En resumen, estamos en camino para el lanzamiento\", dije. Las cabezas asintieron alrededor de la mesa."
          },
          {
            "id": "p38-4",
            "translation": "Terminé de explicar el nuevo proceso. \"¿Tiene sentido hasta ahora?\", pregunté. Un colega levantó el pulgar."
          },
          {
            "id": "p38-5",
            "translation": "La hora casi terminaba y la energía se desvanecía. \"Concluyamos aquí por hoy\", dije. Acordamos terminar lo demás por correo electrónico."
          }
        ]
      },
      "ja": {
        "subtitle": "会議・プレゼンテーション",
        "storyNote": "会議室で自信を持って話す。",
        "paragraphs": [
          {
            "id": "p38-1",
            "translation": "皆がコーヒーを持って席に座った。「では始めましょう」と私は言った。部屋は静まり、スライドが表示された。"
          },
          {
            "id": "p38-2",
            "translation": "うなずきながら次のスライドをクリックした。「予算の方に移りますが」と言った。何人かの人が身を乗り出してもっとよく見た。"
          },
          {
            "id": "p38-3",
            "translation": "最後のスライドに到達して一呼吸置いた。「まとめると、私たちは発売に向けて順調です」と言った。テーブルの周りで皆がうなずいた。"
          },
          {
            "id": "p38-4",
            "translation": "新しいプロセスの説明を終えた。「ここまでで理解できていますか？」と聞いた。同僚が親指を立てた。"
          },
          {
            "id": "p38-5",
            "translation": "時間がもうすぐ終わり、雰囲気が薄れていった。「今日はここでまとめましょう」と言った。残りはメールで終わらせることに決めた。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "会议·演示",
        "storyNote": "在会议室里自信地发言。",
        "paragraphs": [
          {
            "id": "p38-1",
            "translation": "大家拿着咖啡坐下了。\"让我们开始吧，各位，\"我说道。房间里安静下来，幻灯片出现了。"
          },
          {
            "id": "p38-2",
            "translation": "我点头点击了下一张幻灯片。\"接下来讨论预算，\"我说。几个人身体前倾，想看得更清楚。"
          },
          {
            "id": "p38-3",
            "translation": "我到了最后一张幻灯片，停顿了一下。\"总结一下，我们的发布进度很顺利，\"我说。大家在桌子周围点了点头。"
          },
          {
            "id": "p38-4",
            "translation": "我讲完了新流程。\"到目前为止有意义吗？\"我问道。一位同事竖起了大拇指。"
          },
          {
            "id": "p38-5",
            "translation": "时间快到了，气氛有所下降。\"今天就到这里吧，\"我说。我们同意用邮件完成剩下的部分。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "會議·演示",
        "storyNote": "在會議室裡自信地發言。",
        "paragraphs": [
          {
            "id": "p38-1",
            "translation": "大家拿著咖啡坐下了。\"讓我們開始吧，各位，\"我說道。房間裡安靜下來，幻燈片出現了。"
          },
          {
            "id": "p38-2",
            "translation": "我點頭點擊了下一張幻燈片。\"接下來討論預算，\"我說。幾個人身體前傾，想看得更清楚。"
          },
          {
            "id": "p38-3",
            "translation": "我到了最後一張幻燈片，停頓了一下。\"總結一下，我們的發佈進度很順利，\"我說。大家在桌子周圍點了點頭。"
          },
          {
            "id": "p38-4",
            "translation": "我講完了新流程。\"到目前為止有意義嗎？\"我問道。一位同事豎起了大拇指。"
          },
          {
            "id": "p38-5",
            "translation": "時間快到了，氣氛有所下降。\"今天就到這裡吧，\"我說。我們同意用郵件完成剩下的部分。"
          }
        ]
      },
      "fr": {
        "subtitle": "Réunions et Présentations",
        "storyNote": "Parler avec assurance dans la salle de réunion.",
        "paragraphs": [
          {
            "id": "p38-1",
            "translation": "Les gens se sont installés dans leurs sièges avec du café. « Commençons, tout le monde », ai-je dit. La salle s'est tue et les diapositives ont apparu."
          },
          {
            "id": "p38-2",
            "translation": "J'ai cliqué sur la diapositive suivante d'un signe de tête. « Passons au budget », ai-je dit. Quelques personnes se sont penchées en avant pour regarder de plus près."
          },
          {
            "id": "p38-3",
            "translation": "J'ai atteint la dernière diapositive et j'ai marqué une pause. « En résumé, nous sommes sur la bonne voie pour le lancement », ai-je dit. Les têtes ont hoché autour de la table."
          },
          {
            "id": "p38-4",
            "translation": "J'ai terminé d'expliquer le nouveau processus. « Est-ce clair jusqu'à présent ? », ai-je demandé. Un collègue a levé le pouce."
          },
          {
            "id": "p38-5",
            "translation": "L'heure tirait à sa fin et l'énergie s'essoufflait. « Arrêtons-nous là pour aujourd'hui », ai-je dit. Nous avons convenu de terminer le reste par courriel."
          }
        ]
      },
      "de": {
        "subtitle": "Besprechungen und Präsentationen",
        "storyNote": "Mit Selbstbewusstsein im Konferenzraum sprechen.",
        "paragraphs": [
          {
            "id": "p38-1",
            "translation": "Die Leute setzten sich mit Kaffee hin. \"Lasst uns anfangen, alle zusammen\", sagte ich. Der Raum wurde still und die Folien erschienen."
          },
          {
            "id": "p38-2",
            "translation": "Ich klickte mit einem Nicken auf die nächste Folie. \"Kommen wir zum Budget\", sagte ich. Ein paar Leute beugten sich vor, um genauer zu schauen."
          },
          {
            "id": "p38-3",
            "translation": "Ich erreichte die letzte Folie und machte eine Pause. \"Zusammengefasst sind wir auf Kurs für den Launch\", sagte ich. Köpfe nickten rund um den Tisch."
          },
          {
            "id": "p38-4",
            "translation": "Ich beendete die Erklärung des neuen Prozesses. \"Ist das bis jetzt verständlich?\", fragte ich. Ein Kollege gab mir einen Daumen hoch."
          },
          {
            "id": "p38-5",
            "translation": "Die Stunde war fast vorbei und die Energie ließ nach. \"Schließen wir hier für heute ab\", sagte ich. Wir einigten uns darauf, den Rest per E-Mail zu erledigen."
          }
        ]
      }
    }
  },
  {
    "storyId": 39,
    "translations": {
      "es": {
        "subtitle": "Negociación y resolución de problemas",
        "storyNote": "Suavemente, pero con claridad.",
        "paragraphs": [
          {
            "id": "p39-1",
            "translation": "El presupuesto era más alto de lo esperado. \"¿Sería posible bajar un poco el precio?\" pregunté. Hizo una pausa y luego ofreció un pequeño descuento."
          },
          {
            "id": "p39-2",
            "translation": "Presentó un argumento justo y lo escuché completamente. \"Entiendo tu punto, pero es un poco arriesgado\", dije. Comenzamos a buscar un camino intermedio."
          },
          {
            "id": "p39-3",
            "translation": "Ninguno de nosotros quería rendirse completamente. \"Encontrémonos a mitad de camino en esto\", sugerí. Dividimos la diferencia y ambos nos sentimos bien."
          },
          {
            "id": "p39-4",
            "translation": "El acuerdo estaba cerca pero no del todo. \"¿Podemos resolver algo hoy?\" pregunté. Asintió y continuamos hablando con calma."
          },
          {
            "id": "p39-5",
            "translation": "El problema parecía grande, pero no imposible. \"Encontremos una forma de arreglarlo juntos\", dije. Listamos cada opción en la pizarra."
          }
        ]
      },
      "ja": {
        "subtitle": "交渉・問題解決",
        "storyNote": "柔らかく、しかし明確に進める。",
        "paragraphs": [
          {
            "id": "p39-1",
            "translation": "見積もりは予想より高かった。「少し価格を下げることは可能でしょうか？」と聞いた。彼は一呼吸置いて、小さな割引を提示してくれた。"
          },
          {
            "id": "p39-2",
            "translation": "彼は妥当な主張をし、私は完全に耳を傾けた。「あなたの言い分は分かりますが、少しリスクがあります」と言った。私たちは折衷案を探り始めた。"
          },
          {
            "id": "p39-3",
            "translation": "どちらも完全に譲歩したくなかった。「このことで折半しませんか」と提案した。差を半分にして、二人とも納得した。"
          },
          {
            "id": "p39-4",
            "translation": "取引はほぼまとまりかけていたが、完全ではなかった。「今日何か解決できることはないでしょうか？」と聞いた。彼は頷き、私たちは冷静に話を続けた。"
          },
          {
            "id": "p39-5",
            "translation": "問題は大きく見えたが、不可能ではなかった。「一緒にこれを直す方法を探そう」と言った。ホワイトボードにすべての選択肢をリストアップした。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "谈判·问题解决",
        "storyNote": "温和而坚定地推进。",
        "paragraphs": [
          {
            "id": "p39-1",
            "translation": "报价比我们预期的要高。\"能否稍微降低一下价格呢？\"我问道。他停顿了一下，然后提供了一个小幅折扣。"
          },
          {
            "id": "p39-2",
            "translation": "他提出了有力的论点，我充分倾听了。\"我理解你的观点，但这有点冒险，\"我说。我们开始寻找折中之路。"
          },
          {
            "id": "p39-3",
            "translation": "我们都不想完全放弃。\"让我们在这件事上各退一步，\"我建议。我们平分了差异，双方都感到满意。"
          },
          {
            "id": "p39-4",
            "translation": "交易接近但还不够完美。\"我们今天能达成什么协议吗？\"我问道。他点头同意，我们继续冷静地交谈。"
          },
          {
            "id": "p39-5",
            "translation": "问题看起来很大，但并非不可能。\"让我们一起找个办法解决这个问题，\"我说。我们把所有选项都列在白板上。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "談判·問題解決",
        "storyNote": "溫和而堅定地推進。",
        "paragraphs": [
          {
            "id": "p39-1",
            "translation": "報價比我們預期的要高。\"能否稍微降低一下價格呢？\"我問道。他停頓了一下，然後提供了一個小幅折扣。"
          },
          {
            "id": "p39-2",
            "translation": "他提出了有力的論點，我充分傾聽了。\"我理解你的觀點，但這有點冒險，\"我說。我們開始尋找折中之路。"
          },
          {
            "id": "p39-3",
            "translation": "我們都不想完全放棄。\"讓我們在這件事上各退一步，\"我建議。我們平分了差異，雙方都感到滿意。"
          },
          {
            "id": "p39-4",
            "translation": "交易接近但還不夠完美。\"我們今天能達成什麼協議嗎？\"我問道。他點頭同意，我們繼續冷靜地交談。"
          },
          {
            "id": "p39-5",
            "translation": "問題看起來很大，但並非不可能。\"讓我們一起找個辦法解決這個問題，\"我說。我們把所有選項都列在白板上。"
          }
        ]
      },
      "fr": {
        "subtitle": "Négociation et résolution de problèmes",
        "storyNote": "Doucement, mais clairement.",
        "paragraphs": [
          {
            "id": "p39-1",
            "translation": "Le devis était plus élevé que prévu. \"Serait-il possible de baisser un peu le prix ?\" ai-je demandé. Il a fait une pause, puis a offert une petite remise."
          },
          {
            "id": "p39-2",
            "translation": "Il a présenté un argument convaincant et j'ai écouté attentivement. \"Je comprends votre point, mais c'est un peu risqué,\" ai-je dit. Nous avons commencé à chercher un chemin intermédiaire."
          },
          {
            "id": "p39-3",
            "translation": "Aucun de nous ne voulait abandonner complètement. \"Mettons-nous d'accord sur un point milieu,\" ai-je suggéré. Nous avons divisé la différence et nous nous sommes tous deux sentis soulagés."
          },
          {
            "id": "p39-4",
            "translation": "L'accord était proche mais pas tout à fait là. \"Pouvons-nous conclure quelque chose aujourd'hui ?\" ai-je demandé. Il a hoché la tête et nous avons continué à parler calmement."
          },
          {
            "id": "p39-5",
            "translation": "Le problème semblait grand, mais pas impossible. \"Trouvons ensemble un moyen de le résoudre,\" ai-je dit. Nous avons listé toutes les options sur le tableau blanc."
          }
        ]
      },
      "de": {
        "subtitle": "Verhandlung und Problemlösung",
        "storyNote": "Sanft, aber bestimmt.",
        "paragraphs": [
          {
            "id": "p39-1",
            "translation": "Das Angebot war höher als erwartet. \"Wäre es möglich, den Preis ein wenig zu senken?\" fragte ich. Er machte eine Pause und bot dann einen kleinen Rabatt an."
          },
          {
            "id": "p39-2",
            "translation": "Er brachte ein überzeugenderes Argument vor und ich höre aufmerksam zu. \"Ich verstehe deinen Standpunkt, aber es ist ein wenig riskant,\" sagte ich. Wir begannen, einen Mittelweg zu suchen."
          },
          {
            "id": "p39-3",
            "translation": "Keiner von uns wollte ganz nachgeben. \"Lassen Sie uns uns darauf einigen, die Differenz zu teilen,\" schlug ich vor. Wir teilten den Unterschied auf und beide waren zufrieden."
          },
          {
            "id": "p39-4",
            "translation": "Das Geschäft war nah dran, aber nicht ganz dort. \"Können wir heute etwas aushandeln?\" fragte ich. Er nickte und wir redeten weiter, ruhig und besonnen."
          },
          {
            "id": "p39-5",
            "translation": "Das Problem sah groß aus, aber nicht unmöglich. \"Lassen Sie uns zusammen einen Weg finden, das zu beheben,\" sagte ich. Wir listeten jede Option auf dem Whiteboard auf."
          }
        ]
      }
    }
  },
  {
    "storyId": 40,
    "translations": {
      "es": {
        "subtitle": "Expresar sentimientos y reacciones",
        "storyNote": "Expresa tus verdaderos sentimientos como un hablante nativo.",
        "paragraphs": [
          {
            "id": "p40-1",
            "translation": "Me mostró el calendario y me quedé congelada. \"No puedo creer que ya sea diciembre\", dije. Todo el año se nos había pasado volando."
          },
          {
            "id": "p40-2",
            "translation": "Me contó la buena noticia durante la cena. \"Me da mucha alegría escuchar eso\", dije. No podía dejar de sonreír el resto de la noche."
          },
          {
            "id": "p40-3",
            "translation": "Cruzó la meta sin aliento. \"Estoy tan orgullosa de ti por terminar\", dije. Me abrazó, todavía recuperando el aliento."
          },
          {
            "id": "p40-4",
            "translation": "El reloj marcaba y él seguía sin llegar. \"Me vuelve loca cuando la gente llega tarde\", murmuré. Ella me recordó que respirara."
          },
          {
            "id": "p40-5",
            "translation": "Los resultados de la prueba finalmente llegaron y estaban claros. \"Ay, qué alivio\", respiré. Celebramos con una cena tranquila y feliz."
          }
        ]
      },
      "ja": {
        "subtitle": "感情と反応の表現",
        "storyNote": "ネイティブスピーカーのように本当の感情を表現しよう。",
        "paragraphs": [
          {
            "id": "p40-1",
            "translation": "彼女はカレンダーを見せてくれて、私は固まった。「もう12月なんて信じられない」と言った。1年全体が私たちをすり抜けていった。"
          },
          {
            "id": "p40-2",
            "translation": "彼女は夕食の間に良いニュースを教えてくれた。「そんなことを聞いて本当に嬉しい」と言った。その夜の残りの間、笑顔が止まらなかった。"
          },
          {
            "id": "p40-3",
            "translation": "彼女はゴール線を息切れしながら横切った。「完走してくれてとても誇りに思う」と言った。彼女は私を抱きしめ、まだ息を整えていた。"
          },
          {
            "id": "p40-4",
            "translation": "時計が刻々と進み、彼はまだ現れていなかった。「人が遅刻するとほんと腹が立つ」とつぶやいた。彼女は息をするよう促してくれた。"
          },
          {
            "id": "p40-5",
            "translation": "検査結果がようやく戻ってきて、すべて良好だった。「ああ、ほっとした」と息をついた。私たちは静かで幸せな夕食で祝った。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "表达感情和反应",
        "storyNote": "像母语使用者一样表达真实的感受。",
        "paragraphs": [
          {
            "id": "p40-1",
            "translation": "她给我看日历，我呆住了。\"我不敢相信已经是十二月了，\"我说。整个一年就这样在我们眼前溜走了。"
          },
          {
            "id": "p40-2",
            "translation": "她在晚餐时告诉我一个好消息。\"听到这个消息我太高兴了，\"我说。整个晚上我都没有停止微笑。"
          },
          {
            "id": "p40-3",
            "translation": "她气喘吁吁地冲过了终点线。\"我为你能坚持完成而感到骄傲，\"我说。她拥抱了我，还在喘着气。"
          },
          {
            "id": "p40-4",
            "translation": "时钟在嘀嗒作响，他还是没来。\"人迟到的时候我真的很烦，\"我嘟囔道。她提醒我要深呼吸。"
          },
          {
            "id": "p40-5",
            "translation": "检查结果终于出来了，一切正常。\"哦，真是太如释重负了，\"我长舒了一口气。我们用一顿宁静而愉快的晚餐庆祝了。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "表達感情和反應",
        "storyNote": "像母語使用者一樣表達真實的感受。",
        "paragraphs": [
          {
            "id": "p40-1",
            "translation": "她給我看日曆，我呆住了。\"我不敢相信已經是十二月了，\"我說。整個一年就這樣在我們眼前溜走了。"
          },
          {
            "id": "p40-2",
            "translation": "她在晚餐時告訴我一個好消息。\"聽到這個消息我太高興了，\"我說。整個晚上我都沒有停止微笑。"
          },
          {
            "id": "p40-3",
            "translation": "她氣喘吁吁地衝過了終點線。\"我為你能堅持完成而感到驕傲，\"我說。她擁抱了我，還在喘著氣。"
          },
          {
            "id": "p40-4",
            "translation": "時鐘在滴答作響，他還是沒來。\"人遲到的時候我真的很煩，\"我嘟囔道。她提醒我要深呼吸。"
          },
          {
            "id": "p40-5",
            "translation": "檢查結果終於出來了，一切正常。\"哦，真是太如釋重負了，\"我長舒了一口氣。我們用一頓寧靜而愉快的晚餐慶祝了。"
          }
        ]
      },
      "fr": {
        "subtitle": "Exprimer les sentiments et les réactions",
        "storyNote": "Exprime tes vrais sentiments comme un locuteur natif.",
        "paragraphs": [
          {
            "id": "p40-1",
            "translation": "Elle m'a montré le calendrier et je me suis figée. \"Je n'arrive pas à croire que nous soyons déjà en décembre\", ai-je dit. Toute l'année nous a glissé entre les doigts."
          },
          {
            "id": "p40-2",
            "translation": "Elle m'a annoncé la bonne nouvelle pendant le dîner. \"J'en suis tellement heureuse d'apprendre ça\", ai-je dit. Je n'ai pas pu arrêter de sourire le reste de la soirée."
          },
          {
            "id": "p40-3",
            "translation": "Elle a franchi la ligne d'arrivée essoufflée. \"Je suis tellement fière de toi d'avoir terminé\", ai-je dit. Elle m'a serrée dans ses bras, reprenant toujours son souffle."
          },
          {
            "id": "p40-4",
            "translation": "L'horloge continuait à sonner et il n'était toujours pas là. \"Les retards me rendent vraiment folle\", ai-je marmonné. Elle m'a rappelé de respirer."
          },
          {
            "id": "p40-5",
            "translation": "Les résultats des tests ont finalement montré que tout allait bien. \"Oh, quel soulagement\", ai-je respiré. Nous avons célébré avec un dîner tranquille et joyeux."
          }
        ]
      },
      "de": {
        "subtitle": "Gefühle und Reaktionen ausdrücken",
        "storyNote": "Drücke deine echten Gefühle wie ein Muttersprachler aus.",
        "paragraphs": [
          {
            "id": "p40-1",
            "translation": "Sie zeigte mir den Kalender und ich erstarrte. \"Ich kann nicht glauben, dass es bereits Dezember ist\", sagte ich. Das ganze Jahr war einfach an uns vorbeigerauscht."
          },
          {
            "id": "p40-2",
            "translation": "Sie erzählte mir die gute Nachricht beim Abendessen. \"Das macht mich so glücklich zu hören\", sagte ich. Ich konnte den Rest des Abends nicht aufhören zu lächeln."
          },
          {
            "id": "p40-3",
            "translation": "Sie überquerte die Ziellinie außer Atem. \"Ich bin so stolz auf dich, dass du es geschafft hast\", sagte ich. Sie umarmte mich, während sie noch immer nach Luft rang."
          },
          {
            "id": "p40-4",
            "translation": "Die Uhr tickte und er war immer noch nicht da. \"Es macht mich verrückt, wenn Menschen zu spät kommen\", murmelte ich. Sie erinnerte mich daran, durchzuatmen."
          },
          {
            "id": "p40-5",
            "translation": "Die Testergebnisse kamen endlich zurück und waren unauffällig. \"Ach, was bin ich erleichtert\", hauchte ich aus. Wir feierten mit einem ruhigen, glücklichen Abendessen."
          }
        ]
      }
    }
  },
  {
    "storyId": 41,
    "translations": {
      "es": {
        "subtitle": "Devoluciones y cambios",
        "storyNote": "Con solo una palabra sobre devoluciones y cambios, tus compras son más seguras.",
        "paragraphs": [
          {
            "id": "p41-1",
            "translation": "Saqué el recibo de mi bolsillo del abrigo. ¿Es demasiado tarde para devolver esta chaqueta?, pregunté. Ella verificó la fecha y dijo que estaba bien."
          },
          {
            "id": "p41-2",
            "translation": "Sostuve el suéter hacia la luz. No me queda bien en el pecho, expliqué. Ella ofreció una talla más grande sin problemas."
          },
          {
            "id": "p41-3",
            "translation": "El color se veía diferente bajo las luces de la tienda. ¿Puedo cambiar este por el azul?, pregunté. Ella lo cambió en el acto."
          },
          {
            "id": "p41-4",
            "translation": "Ella pidió comprobante de compra de inmediato. Aquí está el recibo y mi tarjeta, dije. Ella procesó el reembolso en un minuto."
          },
          {
            "id": "p41-5",
            "translation": "Quería estar seguro antes de comprar más. ¿Cuál es su política de devolución para artículos en venta?, pregunté. Ella dijo catorce días con recibo."
          }
        ]
      },
      "ja": {
        "subtitle": "返品・交換",
        "storyNote": "返品・交換の一言でショッピングがより安心になります。",
        "paragraphs": [
          {
            "id": "p41-1",
            "translation": "コートのポケットからレシートを取り出しました。このジャケットを返品するには遅すぎますか、と聞きました。彼女は日付を確認して、大丈夫だと言いました。"
          },
          {
            "id": "p41-2",
            "translation": "セーターを光にかざしました。胸のところがうまく合いません、と説明しました。彼女は何の問題もなく、ワンサイズ大きいものを提供しました。"
          },
          {
            "id": "p41-3",
            "translation": "色が店の照明の下では違って見えました。これを青いものに交換してもらえますか、と聞きました。彼女はその場で交換してくれました。"
          },
          {
            "id": "p41-4",
            "translation": "彼女はすぐに購入証明を求めました。ここにレシートとカードがあります、と言いました。彼女は1分で払い戻しを処理しました。"
          },
          {
            "id": "p41-5",
            "translation": "もっと買う前に確認したかったです。セール品の返品ポリシーはどうなっていますか、と聞きました。彼女はレシート付きで14日間と言いました。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "退货和换货",
        "storyNote": "只需一句话就能处理退货和换货，购物更放心。",
        "paragraphs": [
          {
            "id": "p41-1",
            "translation": "我从大衣口袋里掏出了收据。这件夹克现在退货还来得及吗，我问道。她检查了日期，说没有问题。"
          },
          {
            "id": "p41-2",
            "translation": "我把毛衣举起来对着光线。它在胸部的地方不太合身，我解释道。她毫不费力地提供了更大的尺码。"
          },
          {
            "id": "p41-3",
            "translation": "颜色在商店灯光下看起来不同。我可以换成蓝色的吗，我问道。她当场给我换了。"
          },
          {
            "id": "p41-4",
            "translation": "她立即要求提供购买证明。这是我的收据和卡，我说。她在一分钟内处理了退款。"
          },
          {
            "id": "p41-5",
            "translation": "我想在购买更多商品前确认一下。你们对折扣商品的退货政策是什么，我问道。她说收据凭证可以退货14天。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "退貨和換貨",
        "storyNote": "只需一句話就能處理退貨和換貨，購物更放心。",
        "paragraphs": [
          {
            "id": "p41-1",
            "translation": "我從大衣口袋裡掏出了收據。這件夾克現在退貨還來得及嗎，我問道。她檢查了日期，說沒有問題。"
          },
          {
            "id": "p41-2",
            "translation": "我把毛衣舉起來對著光線。它在胸部的地方不太合身，我解釋道。她毫不費力地提供了更大的尺碼。"
          },
          {
            "id": "p41-3",
            "translation": "顏色在商店燈光下看起來不同。我可以換成藍色的嗎，我問道。她當場給我換了。"
          },
          {
            "id": "p41-4",
            "translation": "她立即要求提供購買證明。這是我的收據和卡，我說。她在一分鐘內處理了退款。"
          },
          {
            "id": "p41-5",
            "translation": "我想在購買更多商品前確認一下。你們對折扣商品的退貨政策是什麼，我問道。她說收據憑證可以退貨14天。"
          }
        ]
      },
      "fr": {
        "subtitle": "Retours et échanges",
        "storyNote": "Avec un simple mot sur les retours et les échanges, vos achats sont plus sûrs.",
        "paragraphs": [
          {
            "id": "p41-1",
            "translation": "J'ai sorti le reçu de la poche de mon manteau. Est-il trop tard pour retourner cette veste ?, ai-je demandé. Elle a vérifié la date et m'a dit que c'était bon."
          },
          {
            "id": "p41-2",
            "translation": "J'ai tenu le pull face à la lumière. Il ne me va pas bien à la poitrine, ai-je expliqué. Elle m'a proposé une taille plus grande sans aucun problème."
          },
          {
            "id": "p41-3",
            "translation": "La couleur semblait différente sous les lumières du magasin. Puis-je l'échanger pour le bleu ?, ai-je demandé. Elle l'a échangé sur-le-champ."
          },
          {
            "id": "p41-4",
            "translation": "Elle a immédiatement demandé une preuve d'achat. Voici mon reçu et ma carte, ai-je dit. Elle a traité le remboursement en une minute."
          },
          {
            "id": "p41-5",
            "translation": "Je voulais être sûr avant d'acheter davantage. Quelle est votre politique de retour pour les articles en solde ?, ai-je demandé. Elle a dit quatorze jours avec reçu."
          }
        ]
      },
      "de": {
        "subtitle": "Rückgaben und Umtausch",
        "storyNote": "Mit nur einem Wort zu Rückgaben und Umtausch wird das Einkaufen sicherer.",
        "paragraphs": [
          {
            "id": "p41-1",
            "translation": "Ich zog den Kassenbon aus meiner Manteltasche. Ist es zu spät, diese Jacke zurückzugeben?, fragte ich. Sie überprüfte das Datum und sagte, dass es in Ordnung sei."
          },
          {
            "id": "p41-2",
            "translation": "Ich hielt den Pullover gegen das Licht. Er passt mir in der Brust nicht richtig, erklärte ich. Sie bot mir ohne Umstände eine größere Größe an."
          },
          {
            "id": "p41-3",
            "translation": "Die Farbe sah unter den Ladenleuchten anders aus. Kann ich diesen gegen den blauen umtauschen?, fragte ich. Sie tauschte ihn auf der Stelle um."
          },
          {
            "id": "p41-4",
            "translation": "Sie forderte sofort einen Kaufnachweis an. Hier sind mein Kassenbon und meine Karte, sagte ich. Sie verarbeitete die Rückerstattung in einer Minute."
          },
          {
            "id": "p41-5",
            "translation": "Ich wollte sichergehen, bevor ich mehr kaufe. Wie ist Ihre Rückgaberichtlinie für Artikel im Ausverkauf?, fragte ich. Sie sagte vierzehn Tage mit Kassenbon."
          }
        ]
      }
    }
  },
  {
    "storyId": 42,
    "translations": {
      "es": {
        "subtitle": "Comida a domicilio",
        "storyNote": "Pedir comida por delivery es inglés que usamos todos los días.",
        "paragraphs": [
          {
            "id": "p42-1",
            "translation": "Encontré el menú pero no la letra pequeña. \"¿Entregan en el lado este?\" pregunté. Dijeron que sí, con una pequeña tarifa."
          },
          {
            "id": "p42-2",
            "translation": "Abrí la bolsa y conté dos veces. \"Me falta las papas fritas en mi pedido\", dije. Enviaron un reemplazo en quince minutos."
          },
          {
            "id": "p42-3",
            "translation": "Estaba en una llamada y no podía llegar a la puerta. \"¿Puedes dejarlo en la recepción?\" escribí. Él envió una foto para confirmar."
          },
          {
            "id": "p42-4",
            "translation": "Seguía actualizando la pantalla de seguimiento. \"Dice que está a cinco minutos de distancia\", le dije. Agarramos platos y esperamos junto a la puerta."
          },
          {
            "id": "p42-5",
            "translation": "Terminé el último bocado y me recosté. \"Guau, eso fue exactamente lo que necesitaba\", suspiré. Ambos estábamos demasiado llenos para movernos."
          }
        ]
      },
      "ja": {
        "subtitle": "フードデリバリー",
        "storyNote": "デリバリー注文も毎日使う英語です。",
        "paragraphs": [
          {
            "id": "p42-1",
            "translation": "メニューは見つけたが、細かい字は見落とした。「東側に配達してくれますか？」と聞いた。はい、小額の配達料がかかるとのことだった。"
          },
          {
            "id": "p42-2",
            "translation": "袋を開けて２回数えた。「フライドポテトが入っていません」と言った。１５分以内に交換品を送ってくれた。"
          },
          {
            "id": "p42-3",
            "translation": "電話中だったので、ドアまで出られなかった。「フロントデスクに置いてもらえますか？」とテキストした。彼は確認のために写真を送ってくれた。"
          },
          {
            "id": "p42-4",
            "translation": "追跡画面を何度も更新していた。「あと５分で到着するって書いてある」と彼女に言った。皿を用意してドアの近くで待った。"
          },
          {
            "id": "p42-5",
            "translation": "最後の一口を食べて身を引いた。「わあ、本当にぴったりだ」とため息をついた。二人とも満腹で動けなかった。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "外卖配送",
        "storyNote": "订外卖也是我们每天使用的英语。",
        "paragraphs": [
          {
            "id": "p42-1",
            "translation": "我找到了菜单，但没有看清楚小字。\"你们送到东边吗？\"我问道。他们说送，但要收一小笔配送费。"
          },
          {
            "id": "p42-2",
            "translation": "我打开袋子数了两遍。\"我的订单少了薯条，\"我说。他们在十五分钟内送来了替换品。"
          },
          {
            "id": "p42-3",
            "translation": "我在通电话，没法去开门。\"你能把它放在前台吗？\"我发短信问。他发了张照片来确认。"
          },
          {
            "id": "p42-4",
            "translation": "我不停刷新追踪界面。\"显示还有五分钟就到，\"我告诉她。我们拿出盘子在门边等着。"
          },
          {
            "id": "p42-5",
            "translation": "我吃完最后一口，靠在椅子上。\"哇，这真是绝了，\"我叹了口气。我们俩都吃得太饱，动不了了。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "外送美食",
        "storyNote": "點外送也是我們每天使用的英語。",
        "paragraphs": [
          {
            "id": "p42-1",
            "translation": "我找到了菜單，但沒看清楚小字。\"你們送到東邊嗎？\"我問道。他們說送，但要收一筆配送費。"
          },
          {
            "id": "p42-2",
            "translation": "我打開袋子數了兩遍。\"我的訂單少了薯條，\"我說。他們在十五分鐘內送來了替換品。"
          },
          {
            "id": "p42-3",
            "translation": "我在通電話，沒辦法去開門。\"你能把它放在前台嗎？\"我傳簡訊問。他傳了張照片來確認。"
          },
          {
            "id": "p42-4",
            "translation": "我不停重新整理追蹤畫面。\"顯示還有五分鐘就到，\"我告訴她。我們拿出盤子在門邊等著。"
          },
          {
            "id": "p42-5",
            "translation": "我吃完最後一口，往後靠了靠。\"哇，這真是太滿足了，\"我嘆了口氣。我們倆都吃得太飽，動不了了。"
          }
        ]
      },
      "fr": {
        "subtitle": "Livraison de nourriture",
        "storyNote": "Commander une livraison est un anglais que nous utilisons tous les jours.",
        "paragraphs": [
          {
            "id": "p42-1",
            "translation": "J'ai trouvé le menu mais pas les petits caractères. \"Livrez-vous à l'est ?\" ai-je demandé. Ils ont dit oui, avec une petite charge."
          },
          {
            "id": "p42-2",
            "translation": "J'ai ouvert le sac et compté deux fois. \"Il me manque les frites dans ma commande\", ai-je dit. Ils ont envoyé un remplacement en quinze minutes."
          },
          {
            "id": "p42-3",
            "translation": "J'étais au téléphone et je ne pouvais pas atteindre la porte. \"Peux-tu le laisser à la réception ?\" ai-je écrit par texto. Il a envoyé une photo pour confirmer."
          },
          {
            "id": "p42-4",
            "translation": "Je rafraîchissais constamment l'écran de suivi. \"Il dit qu'il arrive dans cinq minutes\", lui ai-je dit. Nous avons pris nos assiettes et attendu près de la porte."
          },
          {
            "id": "p42-5",
            "translation": "J'ai terminé ma dernière bouchée et je me suis adossé. \"Wow, c'était exactement ce qu'il me fallait\", ai-je soupiré. Nous étions tous les deux trop rassasiés pour bouger."
          }
        ]
      },
      "de": {
        "subtitle": "Essen liefern lassen",
        "storyNote": "Essen zu bestellen ist Englisch, das wir jeden Tag benutzen.",
        "paragraphs": [
          {
            "id": "p42-1",
            "translation": "Ich fand das Menü, aber nicht das Kleingedruckte. \"Liefert ihr zur Ostseite?\" fragte ich. Sie sagten ja, mit einer kleinen Gebühr."
          },
          {
            "id": "p42-2",
            "translation": "Ich öffnete die Tüte und zählte zweimal nach. \"In meiner Bestellung fehlen die Pommes\", sagte ich. Sie schickten einen Ersatz innerhalb von fünfzehn Minuten."
          },
          {
            "id": "p42-3",
            "translation": "Ich war am Telefon und konnte die Tür nicht erreichen. \"Kannst du es an der Rezeption abgeben?\" schrieb ich per SMS. Er schickte ein Foto zur Bestätigung."
          },
          {
            "id": "p42-4",
            "translation": "Ich aktualisierte ständig den Tracking-Bildschirm. \"Es sagt, es ist fünf Minuten entfernt\", sagte ich ihr. Wir holten Teller und warteten an der Tür."
          },
          {
            "id": "p42-5",
            "translation": "Ich aß den letzten Bissen und lehnte mich zurück. \"Wow, das war genau das Richtige\", seufzte ich. Wir waren beide zu satt zum Aufstehen."
          }
        ]
      }
    }
  },
  {
    "storyId": 43,
    "translations": {
      "es": {
        "subtitle": "En el avión",
        "storyNote": "Expresiones cortas que se usan en la cabina del avión.",
        "paragraphs": [
          {
            "id": "p43-1",
            "translation": "Verifiqué dos veces mi tarjeta de embarque y la fila. ¿Disculpe, está ocupado este asiento? pregunté. Él sonrió y dijo que era todo mío."
          },
          {
            "id": "p43-2",
            "translation": "Las luces de la cabina acababan de atenuarse para la noche. ¿Le importa si inclino mi asiento? pregunté. Ella dijo que adelante, sin problema."
          },
          {
            "id": "p43-3",
            "translation": "La pantalla del mapa mostraba una larga línea azul. ¿Cuándo aterrizamos en Seúl? pregunté. La azafata dijo que en aproximadamente dos horas."
          },
          {
            "id": "p43-4",
            "translation": "La turbulencia nos había estado meciendo durante un tiempo. Sinceramente, me siento un poco mareado por el vuelo, admití. Ella me entregó un caramelo de jengibre."
          },
          {
            "id": "p43-5",
            "translation": "El aviso del cinturón de seguridad sonó por encima. Estamos a punto de despegar, susurré. Ella agarró el reposabrazos y sonrió."
          }
        ]
      },
      "ja": {
        "subtitle": "飛行機の客室内",
        "storyNote": "客室で使われる短い表現。",
        "paragraphs": [
          {
            "id": "p43-1",
            "translation": "搭乗券と座席の列を二重に確認しました。すみません、この席は塞がっていますか?と尋ねました。彼はほほ笑んで、全部私のものだと言いました。"
          },
          {
            "id": "p43-2",
            "translation": "客室の照明は夜のために薄暗くなったばかりです。座席を倒してもいいですか?と尋ねました。彼女は大丈夫、問題ないと言いました。"
          },
          {
            "id": "p43-3",
            "translation": "地図画面に長い青い線が表示されました。ソウルにはいつ着陸しますか?と尋ねました。客室乗務員は約2時間後だと言いました。"
          },
          {
            "id": "p43-4",
            "translation": "乱気流がしばらく私たちを揺さぶっていました。正直に言うと、少し航空酔いを感じています、と認めました。彼女は生姜キャンディを渡してくれました。"
          },
          {
            "id": "p43-5",
            "translation": "シートベルトサインが上で鳴り響きました。間もなく離陸します、と小声で言いました。彼女はひじ掛けをつかんでニヤッと笑いました。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "飞机上",
        "storyNote": "飞机客舱内使用的简短表达方式。",
        "paragraphs": [
          {
            "id": "p43-1",
            "translation": "我再次检查了登机牌和座位排号。请问，这个座位有人吗？我问道。他微笑着说这个座位是我的。"
          },
          {
            "id": "p43-2",
            "translation": "客舱灯刚刚为了夜间飞行而调暗。你介意我把座椅往后倾吗？我问道。她说可以，没问题。"
          },
          {
            "id": "p43-3",
            "translation": "地图屏幕显示一条长长的蓝线。我们什么时候降落在首尔？我问道。空乘说大约两小时后。"
          },
          {
            "id": "p43-4",
            "translation": "颠簸已经摇晃了我们一段时间。说实话，我有点晕机，我承认道。她递给我一颗生姜糖。"
          },
          {
            "id": "p43-5",
            "translation": "系安全带提示音在头顶响起。我们快要起飞了，我低声说。她抓住扶手，咧嘴笑了。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "飛機上",
        "storyNote": "飛機客艙內使用的簡短表達方式。",
        "paragraphs": [
          {
            "id": "p43-1",
            "translation": "我再次檢查了登機牌和座位排號。請問，這個座位有人嗎？我問道。他微笑著說這個座位是我的。"
          },
          {
            "id": "p43-2",
            "translation": "客艙燈剛剛為了夜間飛行而調暗。你介意我把座椅往後傾嗎？我問道。她說可以，沒問題。"
          },
          {
            "id": "p43-3",
            "translation": "地圖螢幕顯示一條長長的藍線。我們什麼時候降落在首爾？我問道。空乘說大約兩小時後。"
          },
          {
            "id": "p43-4",
            "translation": "顛簸已經搖晃了我們一段時間。說實話，我有點暈機，我承認道。她遞給我一顆生薑糖。"
          },
          {
            "id": "p43-5",
            "translation": "系安全帶提示音在頭頂響起。我們快要起飛了，我低聲說。她抓住扶手，咧嘴笑了。"
          }
        ]
      },
      "fr": {
        "subtitle": "Dans l'avion",
        "storyNote": "Courtes expressions utilisées dans la cabine de l'avion.",
        "paragraphs": [
          {
            "id": "p43-1",
            "translation": "J'ai vérifié deux fois ma carte d'embarquement et le numéro de rangée. Excusez-moi, est-ce que cette place est occupée ? ai-je demandé. Il a souri et a dit que c'était la mienne."
          },
          {
            "id": "p43-2",
            "translation": "Les lumières de la cabine venaient de s'atténuer pour la nuit. Vous me permettez de pencher mon siège en arrière ? ai-je demandé. Elle a dit d'accord, pas de problème."
          },
          {
            "id": "p43-3",
            "translation": "L'écran de la carte montrait une longue ligne bleue. Quand atterrissons-nous à Séoul ? ai-je demandé. L'hôtesse a dit dans environ deux heures."
          },
          {
            "id": "p43-4",
            "translation": "Les turbulences nous secouaient depuis un moment. Pour être honnête, je me sens un peu malade, ai-je admis. Elle m'a donné un bonbon au gingembre."
          },
          {
            "id": "p43-5",
            "translation": "Le signal de la ceinture de sécurité a retenti au-dessus. Nous sommes sur le point de décoller, ai-je chuchoté. Elle a agrippé l'accoudoir et a souri."
          }
        ]
      },
      "de": {
        "subtitle": "An Bord des Flugzeugs",
        "storyNote": "Kurze Ausdrücke, die in der Flugzeugkabine verwendet werden.",
        "paragraphs": [
          {
            "id": "p43-1",
            "translation": "Ich überprüfte zweimal meine Bordkarte und die Reihe. Entschuldigen Sie, ist dieser Platz besetzt? fragte ich. Er lächelte und sagte, er gehöre mir."
          },
          {
            "id": "p43-2",
            "translation": "Die Kabinenlichter waren gerade für die Nacht gedimmt worden. Macht es Ihnen etwas aus, wenn ich meinen Sitz nach hinten neige? fragte ich. Sie sagte, kein Problem."
          },
          {
            "id": "p43-3",
            "translation": "Der Kartenschirm zeigte eine lange blaue Linie. Wann landen wir in Seoul? fragte ich. Die Stewardess sagte, in etwa zwei Stunden."
          },
          {
            "id": "p43-4",
            "translation": "Die Turbulenzen schüttelten uns schon eine Weile. Ich gebe es zu, mir ist etwas luftkrank, sagte ich. Sie reichte mir ein Ingwerbon­bon."
          },
          {
            "id": "p43-5",
            "translation": "Das Anschnallzeichen leuchtete oben auf. Wir heben gleich ab, flüsterte ich. Sie griff nach der Armlehne und grinste."
          }
        ]
      }
    }
  },
  {
    "storyId": 44,
    "translations": {
      "es": {
        "subtitle": "Estacionamiento",
        "storyNote": "El estacionamiento en una palabra causa estrés.",
        "paragraphs": [
          {
            "id": "p44-1",
            "translation": "Dimos vueltas por la manzana dos veces sin suerte. \"¿Dónde puedo estacionar por aquí?\" le pregunté a un guardia. Él señaló un lote detrás del banco."
          },
          {
            "id": "p44-2",
            "translation": "El letrero junto a la acera estaba medio desteñido. \"¿Puedo estacionar aquí los fines de semana?\" pregunté. Ella dijo que sí, después de las seis los sábados."
          },
          {
            "id": "p44-3",
            "translation": "Un empleado me hizo señas mientras entraba. \"Lo siento, no puedes estacionar en esta fila,\" dijo. Retrocedí y encontré otro lugar."
          },
          {
            "id": "p44-4",
            "translation": "Volví a encontrar un papel bajo el limpiaparabrisas. \"Genial, me pusieron una multa de estacionamiento,\" gruñí. Ella me recordó que leyera los letreros la próxima vez."
          },
          {
            "id": "p44-5",
            "translation": "Cada espacio que pasábamos estaba ya lleno. \"No hay estacionamiento en ningún lado,\" suspiré. Nos rendimos y tomamos el tren en su lugar."
          }
        ]
      },
      "ja": {
        "subtitle": "駐車",
        "storyNote": "駐車は一言でストレスを与えます。",
        "paragraphs": [
          {
            "id": "p44-1",
            "translation": "ブロックを2周回りましたが、運がありませんでした。「このあたりどこに駐車できますか？」警備員に聞きました。彼は銀行の後ろの駐車場を指しました。"
          },
          {
            "id": "p44-2",
            "translation": "歩道の看板は半分褪せていました。「週末ここに駐車できますか？」と聞きました。土曜日の午後6時以降ならいいと彼女は言いました。"
          },
          {
            "id": "p44-3",
            "translation": "停車員が私が入るときに手を振りました。「申し訳ありませんが、この列には駐車できません」と彼は言いました。後ろに戻り、別の場所を見つけました。"
          },
          {
            "id": "p44-4",
            "translation": "ワイパーの下に挟まった紙を見つけました。「やった、駐車違反切符をもらった」とうめきました。彼女は次回は看板を読むように思い出させてくれました。"
          },
          {
            "id": "p44-5",
            "translation": "通り過ぎたすべてのスペースはすでに満車でした。「どこにも駐車場がない」とため息をつきました。あきらめて代わりに電車を利用しました。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "停车",
        "storyNote": "停车一个词就能引起压力。",
        "paragraphs": [
          {
            "id": "p44-1",
            "translation": "我们绕着街区转了两圈，但没有找到停车位。\"这附近我在哪里能停车？\"我问一位保安。他指向银行后面的停车场。"
          },
          {
            "id": "p44-2",
            "translation": "路边的标志褪色了一半。\"我能在周末在这里停车吗？\"我问。她说可以，周六晚上六点以后。"
          },
          {
            "id": "p44-3",
            "translation": "我开进去时，一位服务员挥手示意我停下。\"抱歉，你不能在这一排停车，\"他说。我倒车出去，找到了另一个停车位。"
          },
          {
            "id": "p44-4",
            "translation": "我回来时发现雨刮器下塞着一张纸条。\"太好了，我收到了停车罚单，\"我抱怨道。她提醒我下次要看清标志。"
          },
          {
            "id": "p44-5",
            "translation": "我们经过的每个车位都已经停满了。\"到处都没有停车位了，\"我叹了口气。我们放弃了，改乘火车。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "停車",
        "storyNote": "停車一個詞就能引起壓力。",
        "paragraphs": [
          {
            "id": "p44-1",
            "translation": "我們繞著街區轉了兩圈，但沒有找到停車位。「這附近我在哪裡能停車？」我問一位保安。他指向銀行後面的停車場。"
          },
          {
            "id": "p44-2",
            "translation": "路邊的標誌褪色了一半。「我能在週末在這裡停車嗎？」我問。她說可以，週六晚上六點以後。"
          },
          {
            "id": "p44-3",
            "translation": "我開進去時，一位服務員揮手示意我停下。「抱歉，你不能在這一排停車，」他說。我倒車出去，找到了另一個停車位。"
          },
          {
            "id": "p44-4",
            "translation": "我回來時發現雨刮器下塞著一張紙條。「太好了，我收到了停車罰單，」我抱怨道。她提醒我下次要看清標誌。"
          },
          {
            "id": "p44-5",
            "translation": "我們經過的每個車位都已經停滿了。「到處都沒有停車位了，」我嘆了口氣。我們放棄了，改乘火車。"
          }
        ]
      },
      "fr": {
        "subtitle": "Stationnement",
        "storyNote": "Le stationnement en un mot cause du stress.",
        "paragraphs": [
          {
            "id": "p44-1",
            "translation": "Nous avons tourné autour du pâté de maisons deux fois sans succès. « Où puis-je me garer par ici ? » ai-je demandé à un gardien. Il a pointé du doigt vers un parking derrière la banque."
          },
          {
            "id": "p44-2",
            "translation": "Le panneau au bord du trottoir était à moitié effacé. « Puis-je me garer ici le week-end ? » ai-je demandé. Elle a dit oui, après dix-huit heures le samedi."
          },
          {
            "id": "p44-3",
            "translation": "Un préposé m'a fait signe alors que j'entrais. « Désolé, vous ne pouvez pas vous garer dans cette rangée, » a-t-il dit. J'ai reculé et trouvé une autre place."
          },
          {
            "id": "p44-4",
            "translation": "Je suis revenu à une contravention glissée sous mon essuie-glace. « Parfait, j'ai reçu une amende de stationnement, » ai-je grogne. Elle m'a rappelé de lire les panneaux la prochaine fois."
          },
          {
            "id": "p44-5",
            "translation": "Chaque place que nous avons passée était déjà occupée. « Il n'y a nulle part où se garer, » ai-je soupiré. Nous avons renoncé et avons pris le train à la place."
          }
        ]
      },
      "de": {
        "subtitle": "Parkplatz",
        "storyNote": "Parken ist ein Wort, das Stress verursacht.",
        "paragraphs": [
          {
            "id": "p44-1",
            "translation": "Wir fuhren zweimal um den Block, ohne Glück zu haben. \"Wo kann ich hier in der Nähe parken?\" fragte ich einen Wachmann. Er zeigte auf einen Parkplatz hinter der Bank."
          },
          {
            "id": "p44-2",
            "translation": "Das Schild am Bordstein war halb verblasst. \"Darf ich hier am Wochenende parken?\" fragte ich. Sie sagte ja, nach sechs Uhr am Samstag."
          },
          {
            "id": "p44-3",
            "translation": "Ein Parkplatzwächter winkte mich an, als ich einfuhr. \"Entschuldigung, Sie können in dieser Reihe nicht parken,\" sagte er. Ich fuhr zurück und fand einen anderen Platz."
          },
          {
            "id": "p44-4",
            "translation": "Ich kam zurück und fand einen Zettel unter meinem Scheibenwischer. \"Großartig, ich habe einen Strafzettel bekommen,\" stöhnte ich. Sie erinnerte mich daran, die Schilder das nächste Mal zu lesen."
          },
          {
            "id": "p44-5",
            "translation": "Jeder Platz, den wir vorbeifuhren, war bereits belegt. \"Es gibt nirgends einen Parkplatz,\" seufzte ich. Wir gaben auf und nahmen stattdessen den Zug."
          }
        ]
      }
    }
  },
  {
    "storyId": 45,
    "translations": {
      "es": {
        "subtitle": "Internet y wifi",
        "storyNote": "Los problemas de conexión le suceden a cualquiera.",
        "paragraphs": [
          {
            "id": "p45-1",
            "translation": "Me instalé en la cafetería con mi laptop. \"¿Cuál es la contraseña del wifi?\" le pregunté al barista. Él señaló una tarjeta junto a la caja."
          },
          {
            "id": "p45-2",
            "translation": "El pequeño ícono de wifi seguía girando sin parar. \"No puedo conectarme a la red\", dije. Él sugirió olvidar la red e intentar conectarme de nuevo."
          },
          {
            "id": "p45-3",
            "translation": "Tres personas cerca de mí fruncían el ceño mirando sus teléfonos. \"¿Se cayó el internet de nuevo?\" pregunté en voz alta. Un cliente habitual asintió y dijo que sucede a diario."
          },
          {
            "id": "p45-4",
            "translation": "Parecía atrapado mirando fijamente la pantalla de error. \"¿Intentaste reiniciar el router?\" pregunté. Ese truco simple lo arregló al instante."
          },
          {
            "id": "p45-5",
            "translation": "Presioné la página una y otra vez sin éxito. \"No carga sin importar lo que haga\", dije. Él se acercó para echar un vistazo."
          }
        ]
      },
      "ja": {
        "subtitle": "インターネット・WiFi",
        "storyNote": "接続の問題は誰もが経験します。",
        "paragraphs": [
          {
            "id": "p45-1",
            "translation": "カフェでノートパソコンを開いて落ち着いた。「WiFiのパスワードは何ですか?」とバリスタに聞いた。彼はレジの近くのカードを指した。"
          },
          {
            "id": "p45-2",
            "translation": "小さなWiFiアイコンがずっと回り続けていた。「ネットワークに接続できません」と言った。彼は忘れてもう一度接続し直すことを勧めた。"
          },
          {
            "id": "p45-3",
            "translation": "近くにいる3人が携帯電話を眉をひそめながら見ていた。「インターネットがまた落ちてますか?」と大声で聞いた。常連客が頷いて、毎日起こると言った。"
          },
          {
            "id": "p45-4",
            "translation": "彼はエラー画面を見つめたままで身動きできないようだった。「ルーターを再起動してみましたか?」と聞いた。そのコツで瞬時に修正された。"
          },
          {
            "id": "p45-5",
            "translation": "ページを何度も何度もタップしたがうまくいかなかった。「何をしても読み込まれません」と言った。彼は近づいてきて確認してくれた。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "互联网·无线网络",
        "storyNote": "连接问题谁都会遇到。",
        "paragraphs": [
          {
            "id": "p45-1",
            "translation": "我在咖啡馆里打开笔记本电脑坐下来。\"WiFi密码是什么?\"我问咖啡师。她指向收银台旁的一张卡片。"
          },
          {
            "id": "p45-2",
            "translation": "小小的WiFi图标一直在转圈。\"我连不上网络。\"我说。他建议我忘记该网络,然后重新连接。"
          },
          {
            "id": "p45-3",
            "translation": "附近的三个人皱着眉头盯着他们的手机。\"网络又断了吗?\"我大声问道。一位常客点点头说这种事每天都会发生。"
          },
          {
            "id": "p45-4",
            "translation": "他看起来呆呆地盯着错误屏幕。\"你试过重启路由器吗?\"我问道。那一招立刻就解决了问题。"
          },
          {
            "id": "p45-5",
            "translation": "我反复点击页面,但都没有成功。\"无论我怎么做,页面都加载不出来。\"我说。他走过来看一下。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "網際網路·無線網路",
        "storyNote": "連接問題誰都會遇到。",
        "paragraphs": [
          {
            "id": "p45-1",
            "translation": "我在咖啡館裡打開筆記本電腦坐下來。「WiFi密碼是什麼?」我問咖啡師。她指向收銀台旁的一張卡片。"
          },
          {
            "id": "p45-2",
            "translation": "小小的WiFi圖標一直在轉圈。「我連不上網路。」我說。他建議我忘記該網路,然後重新連接。"
          },
          {
            "id": "p45-3",
            "translation": "附近的三個人皺著眉頭盯著他們的手機。「網路又斷了嗎?」我大聲問道。一位常客點點頭說這種事每天都會發生。"
          },
          {
            "id": "p45-4",
            "translation": "他看起來呆呆地盯著錯誤畫面。「你試過重啟路由器嗎?」我問道。那一招立刻就解決了問題。"
          },
          {
            "id": "p45-5",
            "translation": "我反覆點擊頁面,但都沒有成功。「無論我怎麼做,頁面都載入不出來。」我說。他走過來看一下。"
          }
        ]
      },
      "fr": {
        "subtitle": "Internet et wifi",
        "storyNote": "Les problèmes de connexion, tout le monde les connaît.",
        "paragraphs": [
          {
            "id": "p45-1",
            "translation": "Je me suis installée au café avec mon ordinateur portable. « Quel est le mot de passe du wifi? » ai-je demandé au barista. Il a montré une carte près de la caisse."
          },
          {
            "id": "p45-2",
            "translation": "La petite icône wifi n'arrêtait pas de tourner. « Je n'arrive pas à me connecter au réseau », ai-je dit. Il a suggéré d'oublier le réseau et de le rejoindre à nouveau."
          },
          {
            "id": "p45-3",
            "translation": "Trois personnes à proximité fronçaient les sourcils en regardant leurs téléphones. « Internet est encore coupé? » ai-je demandé à haute voix. Un habitué a hoché la tête et a dit que cela se produit chaque jour."
          },
          {
            "id": "p45-4",
            "translation": "Il semblait coincé à fixer l'écran d'erreur. « As-tu essayé de redémarrer le routeur? » ai-je demandé. Cette astuce l'a réparé instantanément."
          },
          {
            "id": "p45-5",
            "translation": "J'ai tapé sur la page encore et encore sans succès. « Elle ne veut pas charger peu importe ce que je fais », ai-je dit. Il s'est approché pour jeter un coup d'œil."
          }
        ]
      },
      "de": {
        "subtitle": "Internet und WLAN",
        "storyNote": "Verbindungsprobleme hat jeder schon mal gehabt.",
        "paragraphs": [
          {
            "id": "p45-1",
            "translation": "Ich setzte mich im Café mit meinem Laptop hin. \"Wie lautet das WLAN-Passwort?\" fragte ich den Barista. Er deutete auf eine Karte neben der Kasse."
          },
          {
            "id": "p45-2",
            "translation": "Das kleine WLAN-Symbol drehte sich einfach weiter. \"Ich kann mich nicht mit dem Netzwerk verbinden\", sagte ich. Er schlug vor, es zu vergessen und erneut beizutreten."
          },
          {
            "id": "p45-3",
            "translation": "Drei Menschen in der Nähe runzelten die Stirn über ihre Handys. \"Ist das Internet wieder weg?\" fragte ich laut. Ein Stammgast nickte und sagte, das passiert täglich."
          },
          {
            "id": "p45-4",
            "translation": "Er starrte wie gelähmt auf den Fehlschirm. \"Hast du versucht, den Router neu zu starten?\" fragte ich. Dieser eine Trick hat es sofort behoben."
          },
          {
            "id": "p45-5",
            "translation": "Ich tippte immer wieder auf die Seite, aber ohne Erfolg. \"Sie will einfach nicht laden, egal was ich mache\", sagte ich. Er kam vorbei, um sich das anzusehen."
          }
        ]
      }
    }
  },
  {
    "storyId": 46,
    "translations": {
      "es": {
        "subtitle": "Paquetes y Oficina de Correos",
        "storyNote": "La vida cotidiana de enviar y recibir: inglés de la oficina de correos.",
        "paragraphs": [
          {
            "id": "p46-1",
            "translation": "Deslicé la caja cuidadosamente sobre el mostrador. ¿Llegará esto el viernes? pregunté. Él verificó y dijo que el jueves, muy probablemente."
          },
          {
            "id": "p46-2",
            "translation": "El cumpleaños era solo en unos días. Tiene que llegar el sábado, insistí. Él recomendó envío express para estar seguro."
          },
          {
            "id": "p46-3",
            "translation": "Empujó un pequeño formulario hacia mí. ¿Necesito llenar esto primero? pregunté. Él asintió y me entregó un bolígrafo."
          },
          {
            "id": "p46-4",
            "translation": "Estaba enviando varias cajas a la vez. ¿Cuál es la forma más barata de enviar estas? pregunté. Él sugirió envío terrestre en un solo paquete."
          },
          {
            "id": "p46-5",
            "translation": "Él imprimió la etiqueta y la pegó encima. Debería llegar en tres días, dijo. Me fui sintiéndome extrañamente realizado."
          }
        ]
      },
      "ja": {
        "subtitle": "小包と郵便局",
        "storyNote": "送受信の日常生活：郵便局の英語。",
        "paragraphs": [
          {
            "id": "p46-1",
            "translation": "私は箱を注意深くカウンターを滑らせました。これは金曜日までに到着しますか？と聞きました。彼は確認して、おそらく木曜日だと言いました。"
          },
          {
            "id": "p46-2",
            "translation": "誕生日はあと数日でした。土曜日までに到着する必要があります、と強調しました。彼は安全のために速達配送を勧めました。"
          },
          {
            "id": "p46-3",
            "translation": "彼は小さな用紙を私の方に押し出しました。これを先に記入する必要がありますか？と聞きました。彼は頷いてペンをくれました。"
          },
          {
            "id": "p46-4",
            "translation": "私は複数の箱を一度に送っていました。これらを送る最も安い方法は何ですか？と聞きました。彼は1つの束で地上配送を勧めました。"
          },
          {
            "id": "p46-5",
            "translation": "彼はラベルを印刷して上に貼り付けました。3日で到着するはずです、と彼は言いました。私は奇妙に達成感を感じながら去りました。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "包裹和邮局",
        "storyNote": "寄收的日常生活：邮局英语。",
        "paragraphs": [
          {
            "id": "p46-1",
            "translation": "我小心地把盒子滑过柜台。这能在周五前到达吗？我问道。他检查了一下，说很可能是周四。"
          },
          {
            "id": "p46-2",
            "translation": "生日只有几天了。它必须在周六前到达，我强调道。他建议为保险起见选择快递服务。"
          },
          {
            "id": "p46-3",
            "translation": "他把一张小表格推向我。我需要先填好这个吗？我问道。他点了点头，递给我一支笔。"
          },
          {
            "id": "p46-4",
            "translation": "我一次要邮寄好几个盒子。寄这些最便宜的方式是什么？我问道。他建议用陆运方式，打成一个包裹。"
          },
          {
            "id": "p46-5",
            "translation": "他打印了标签并贴在上面。应该三天内到达，他说。我离开时感到莫名其妙的成就感。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "包裹和郵局",
        "storyNote": "寄收的日常生活：郵局英語。",
        "paragraphs": [
          {
            "id": "p46-1",
            "translation": "我小心地把盒子滑過櫃台。這能在週五前到達嗎？我問道。他檢查了一下，說很可能是週四。"
          },
          {
            "id": "p46-2",
            "translation": "生日只有幾天了。它必須在週六前到達，我強調道。他建議為保險起見選擇快遞服務。"
          },
          {
            "id": "p46-3",
            "translation": "他把一張小表格推向我。我需要先填好這個嗎？我問道。他點了點頭，遞給我一支筆。"
          },
          {
            "id": "p46-4",
            "translation": "我一次要郵寄好幾個盒子。寄這些最便宜的方式是什麼？我問道。他建議用陸運方式，打成一個包裹。"
          },
          {
            "id": "p46-5",
            "translation": "他打印了標籤並貼在上面。應該三天內到達，他說。我離開時感到莫名其妙的成就感。"
          }
        ]
      },
      "fr": {
        "subtitle": "Colis et Bureau de Poste",
        "storyNote": "La vie quotidienne d'envoyer et recevoir : anglais du bureau de poste.",
        "paragraphs": [
          {
            "id": "p46-1",
            "translation": "J'ai glissé la boîte sur le comptoir avec précaution. Cela arrivera-t-il d'ici vendredi ? ai-je demandé. Il a vérifié et a dit jeudi, très probablement."
          },
          {
            "id": "p46-2",
            "translation": "L'anniversaire n'était que dans quelques jours. Il doit arriver samedi, ai-je insisté. Il a recommandé un envoi express pour plus de sécurité."
          },
          {
            "id": "p46-3",
            "translation": "Il a poussé un petit formulaire vers moi. Dois-je d'abord le remplir ? ai-je demandé. Il a hoché la tête et m'a tendu un stylo."
          },
          {
            "id": "p46-4",
            "translation": "J'envoyais plusieurs boîtes à la fois. Quel est le moyen le moins cher d'envoyer ceux-ci ? ai-je demandé. Il a suggéré un envoi par voie terrestre en un seul paquet."
          },
          {
            "id": "p46-5",
            "translation": "Il a imprimé l'étiquette et l'a collée dessus. Il devrait arriver dans trois jours, a-t-il dit. Je suis parti en me sentant bizarrement accompli."
          }
        ]
      },
      "de": {
        "subtitle": "Pakete und Postamt",
        "storyNote": "Der alltägliche Versand und Empfang: Englisch der Post.",
        "paragraphs": [
          {
            "id": "p46-1",
            "translation": "Ich schob die Schachtel vorsichtig über die Theke. Kommt das bis Freitag an? fragte ich. Er überprüfte es und sagte, dass es wahrscheinlich Donnerstag sein würde."
          },
          {
            "id": "p46-2",
            "translation": "Der Geburtstag war nur noch einige Tage entfernt. Es muss bis Samstag ankommen, betonte ich. Er empfahl Expressversand, um auf Nummer sicher zu gehen."
          },
          {
            "id": "p46-3",
            "translation": "Er schob ein kleines Formular zu mir hin. Muss ich das vorher ausfüllen? fragte ich. Er nickte und gab mir einen Stift."
          },
          {
            "id": "p46-4",
            "translation": "Ich versandte mehrere Schachteln auf einmal. Was ist die billigste Möglichkeit, diese zu versenden? fragte ich. Er schlug vor, mehrere Pakete zusammen per Bodenversand zu schicken."
          },
          {
            "id": "p46-5",
            "translation": "Er druckte das Etikett aus und klebte es oben auf. Es sollte in drei Tagen ankommen, sagte er. Ich verließ das Geschäft mit einem seltsamen Gefühl der Erfüllung."
          }
        ]
      }
    }
  },
  {
    "storyId": 47,
    "translations": {
      "es": {
        "subtitle": "Una reserva",
        "storyNote": "Una sola reserva organiza todo tu día.",
        "paragraphs": [
          {
            "id": "p47-1",
            "translation": "Llamé al salón durante mi descanso. \"¿Tienen algún hueco el viernes?\" pregunté. Encontró un espacio a las cuatro."
          },
          {
            "id": "p47-2",
            "translation": "Recorrí el calendario en la pantalla. \"¿El sábado a las siete está disponible?\" pregunté. Ella confirmó y anotó mi nombre."
          },
          {
            "id": "p47-3",
            "translation": "El lugar era popular y siempre estaba lleno. \"¿Con cuánta anticipación debo reservar?\" pregunté. Ella dijo que al menos dos semanas para los fines de semana."
          },
          {
            "id": "p47-4",
            "translation": "No estaba seguro si aceptaban clientes sin cita. \"¿Necesito una reserva o puedo llegar sin más?\" pregunté. Ella dijo que una reserva era más segura."
          },
          {
            "id": "p47-5",
            "translation": "Mi agenda se había liberado de repente. \"¿Hay alguna posibilidad de que me encajen esta tarde?\" pregunté. Ella me acomodó a las tres."
          }
        ]
      },
      "ja": {
        "subtitle": "予約",
        "storyNote": "一つの予約で一日がまとまる。",
        "paragraphs": [
          {
            "id": "p47-1",
            "translation": "昼休みにサロンに電話した。「金曜日に空きはありますか？」と聞いた。スタッフは4時のスロットを見つけてくれた。"
          },
          {
            "id": "p47-2",
            "translation": "画面のカレンダーをスクロールした。「土曜日の7時は空いていますか？」と聞いた。彼女が確認して、私の名前を記録した。"
          },
          {
            "id": "p47-3",
            "translation": "そのお店は人気があり、いつも満員だった。「どのくらい前に予約すべきですか？」と聞いた。彼女は週末は最低2週間前と言った。"
          },
          {
            "id": "p47-4",
            "translation": "予約なしで行ってもいいのか確認したかった。「予約が必要ですか、それとも直接行ってもいいですか？」と聞いた。彼女は予約の方が安全だと言った。"
          },
          {
            "id": "p47-5",
            "translation": "突然スケジュールが空いた。「今日の午後に入れていただくことは可能ですか？」と聞いた。彼女が3時に詰め込んでくれた。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "预约",
        "storyNote": "一个预约就能理顺整个一天。",
        "paragraphs": [
          {
            "id": "p47-1",
            "translation": "我在午休时间打电话给沙龙。\"周五有空位吗？\"我问道。她找到了四点的时间段。"
          },
          {
            "id": "p47-2",
            "translation": "我在屏幕上浏览日历。\"周六七点有空吗？\"我问道。她确认了，并记下了我的名字。"
          },
          {
            "id": "p47-3",
            "translation": "这家店很受欢迎，生意总是很好。\"我应该提前多久预约？\"我问道。她说周末至少要提前两周。"
          },
          {
            "id": "p47-4",
            "translation": "我不确定是否可以不预约直接过去。\"我需要预约，还是可以直接来？\"我问道。她说预约比较保险。"
          },
          {
            "id": "p47-5",
            "translation": "我的日程突然有了空闲。\"你们今天下午能临时加我一个时间段吗？\"我问道。她在三点给我挤了进去。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "預約",
        "storyNote": "一個預約就能理順整個一天。",
        "paragraphs": [
          {
            "id": "p47-1",
            "translation": "我在午休時間打電話給沙龍。\"週五有空位嗎？\"我問道。她找到了四點的時間段。"
          },
          {
            "id": "p47-2",
            "translation": "我在螢幕上瀏覽日曆。\"週六七點有空嗎？\"我問道。她確認了，並記下了我的名字。"
          },
          {
            "id": "p47-3",
            "translation": "這家店很受歡迎，生意總是很好。\"我應該提前多久預約？\"我問道。她說週末至少要提前兩週。"
          },
          {
            "id": "p47-4",
            "translation": "我不確定是否可以不預約直接過去。\"我需要預約，還是可以直接來？\"我問道。她說預約比較保險。"
          },
          {
            "id": "p47-5",
            "translation": "我的日程突然有了空閒。\"你們今天下午能臨時加我一個時間段嗎？\"我問道。她在三點給我擠了進去。"
          }
        ]
      },
      "fr": {
        "subtitle": "Une réservation",
        "storyNote": "Une seule réservation organise toute la journée.",
        "paragraphs": [
          {
            "id": "p47-1",
            "translation": "J'ai appelé le salon pendant ma pause déjeuner. \"Avez-vous des disponibilités vendredi ?\" ai-je demandé. Elle a trouvé un créneau à quatre heures."
          },
          {
            "id": "p47-2",
            "translation": "J'ai parcouru le calendrier à l'écran. \"Samedi à dix-neuf heures, c'est disponible ?\" ai-je demandé. Elle a confirmé et a noté mon nom."
          },
          {
            "id": "p47-3",
            "translation": "L'endroit était populaire et toujours complet. \"Combien de temps à l'avance dois-je réserver ?\" ai-je demandé. Elle a dit au moins deux semaines pour les fins de semaine."
          },
          {
            "id": "p47-4",
            "translation": "Je n'étais pas sûr si les clients sans rendez-vous étaient acceptés. \"Ai-je besoin d'une réservation, ou puis-je simplement venir ?\" ai-je demandé. Elle a dit qu'une réservation était plus sûre."
          },
          {
            "id": "p47-5",
            "translation": "Mon agenda s'était soudainement libéré. \"Y a-t-il une chance que vous puissiez me caser cet après-midi ?\" ai-je demandé. Elle m'a glissée à trois heures."
          }
        ]
      },
      "de": {
        "subtitle": "Eine Buchung",
        "storyNote": "Eine Buchung bringt deinen ganzen Tag in Ordnung.",
        "paragraphs": [
          {
            "id": "p47-1",
            "translation": "Ich rief den Salon in meiner Mittagspause an. \"Haben Sie Freitag noch etwas frei?\" fragte ich. Sie fand einen Termin um vier Uhr."
          },
          {
            "id": "p47-2",
            "translation": "Ich scrollte durch den Kalender auf dem Bildschirm. \"Ist Samstag um sieben Uhr verfügbar?\" fragte ich. Sie bestätigte und notierte meinen Namen."
          },
          {
            "id": "p47-3",
            "translation": "Der Ort war beliebt und immer voll besetzt. \"Wie lange im Voraus sollte ich buchen?\" fragte ich. Sie sagte mindestens zwei Wochen für Wochenenden."
          },
          {
            "id": "p47-4",
            "translation": "Ich war mir nicht sicher, ob Laufkundschaft erlaubt war. \"Brauche ich eine Buchung, oder kann ich einfach vorbeikommen?\" fragte ich. Sie sagte, dass eine Buchung sicherer wäre."
          },
          {
            "id": "p47-5",
            "translation": "Mein Terminkalender hatte sich plötzlich geleert. \"Besteht eine Möglichkeit, mich heute Nachmittag noch unterzubringen?\" fragte ich. Sie quetschte mich um drei Uhr ein."
          }
        ]
      }
    }
  },
  {
    "storyId": 48,
    "translations": {
      "es": {
        "subtitle": "Un cambio de planes",
        "storyNote": "Reorganiza tus compromisos con soltura cuando los planes cambian.",
        "paragraphs": [
          {
            "id": "p48-1",
            "translation": "Me molestaba tener que hacerlo la mañana del día. \"Disculpa, surgió algo en casa\", escribí por mensaje. Ella fue amable y dijo que sin problema."
          },
          {
            "id": "p48-2",
            "translation": "Mi mañana de repente se llenó de compromisos. \"¿Podemos posponer la reunión una hora?\", pregunté. El equipo estuvo de acuerdo sin ningún inconveniente."
          },
          {
            "id": "p48-3",
            "translation": "Quería confirmar antes de cerrarlo. \"¿Te sigue viniendo bien el martes?\", pregunté. Ella lo verificó y dijo que era perfecto."
          },
          {
            "id": "p48-4",
            "translation": "Mi día se había desmoronado completamente. \"No voy a poder ir esta noche\", dije. Acordamos intentarlo de nuevo la próxima semana."
          },
          {
            "id": "p48-5",
            "translation": "Ambos hojeamos nuestros calendarios. \"Apuntemos para el próximo jueves en su lugar\", sugerí. Ella lo anotó enseguida."
          }
        ]
      },
      "ja": {
        "subtitle": "予定変更",
        "storyNote": "変わった予定もスムーズに整理しましょう。",
        "paragraphs": [
          {
            "id": "p48-1",
            "translation": "当日の朝にそれをするのは気が引けた。「申し訳ありませんが、家で何か出てきました」とメッセージを送った。彼女は親切で、全く問題ないと言ってくれた。"
          },
          {
            "id": "p48-2",
            "translation": "朝が突然予定でいっぱいになった。「会議を1時間遅らせることはできますか？」と聞いた。チームは何の問題もなく同意してくれた。"
          },
          {
            "id": "p48-3",
            "translation": "決める前に確認したかった。「火曜日はまだ都合がつきますか？」と聞いた。彼女は再確認して、完璧だと言った。"
          },
          {
            "id": "p48-4",
            "translation": "その日は完全に台無しになった。「今夜は行けません」と言った。来週もう一度試すことに同意した。"
          },
          {
            "id": "p48-5",
            "translation": "二人でカレンダーをめくった。「代わりに来週の木曜日を目指しましょう」と提案した。彼女はすぐにそれを書き込んだ。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "改变计划",
        "storyNote": "当计划改变时，也能平稳地重新安排。",
        "paragraphs": [
          {
            "id": "p48-1",
            "translation": "在那天早上这样做让我很遗憾。\"很抱歉，家里临时有些事，\"我发短信说。她很体贴地说没有问题。"
          },
          {
            "id": "p48-2",
            "translation": "我的早上突然排满了日程。\"我们能把会议推后一个小时吗？\"我问道。团队毫无异议地同意了。"
          },
          {
            "id": "p48-3",
            "translation": "在确定之前，我想先确认一下。\"星期二对你来说还合适吗？\"我问道。她重新检查了一下，说完美。"
          },
          {
            "id": "p48-4",
            "translation": "我的一整天都乱套了。\"我今晚去不了，\"我说。我们同意下周再试一次。"
          },
          {
            "id": "p48-5",
            "translation": "我们两个都翻了翻日历。\"我们改为下周四怎么样？\"我建议道。她立刻记了下来。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "改變計畫",
        "storyNote": "當計畫改變時，也能平順地重新安排。",
        "paragraphs": [
          {
            "id": "p48-1",
            "translation": "在那天早上這樣做讓我很遺憾。「很抱歉，家裡臨時有些事，」我傳了簡訊。她很體貼地說沒有問題。"
          },
          {
            "id": "p48-2",
            "translation": "我的早上突然排滿了日程。「我們能把會議推後一個小時嗎？」我問道。團隊毫無異議地同意了。"
          },
          {
            "id": "p48-3",
            "translation": "在確定之前，我想先確認一下。「星期二對你來說還合適嗎？」我問道。她重新檢查了一下，說完美。"
          },
          {
            "id": "p48-4",
            "translation": "我的一整天都亂套了。「我今晚去不了，」我說。我們同意下週再試一次。"
          },
          {
            "id": "p48-5",
            "translation": "我們兩個都翻了翻行事曆。「我們改為下週四怎麼樣？」我建議道。她立刻記了下來。"
          }
        ]
      },
      "fr": {
        "subtitle": "Un changement de plans",
        "storyNote": "Réorganisez vos engagements avec aisance quand les plans changent.",
        "paragraphs": [
          {
            "id": "p48-1",
            "translation": "Je détestais devoir le faire le matin même. « Je suis désolé, quelque chose vient de survenir à la maison », ai-je écrit. Elle a été gentille et a dit que ce n'était pas un problème."
          },
          {
            "id": "p48-2",
            "translation": "Ma matinée était soudainement surchargée. « Pouvons-nous repousser la réunion d'une heure ? », ai-je demandé. L'équipe a accepté sans difficulté."
          },
          {
            "id": "p48-3",
            "translation": "Je voulais confirmer avant de verrouiller l'horaire. « Mardi te convient-il toujours ? », ai-je demandé. Elle a vérifié et a dit que c'était parfait."
          },
          {
            "id": "p48-4",
            "translation": "Ma journée s'était complètement effondrée. « Je ne pourrai pas venir ce soir », ai-je dit. Nous avons convenu de réessayer la semaine prochaine."
          },
          {
            "id": "p48-5",
            "translation": "Nous avons tous les deux feuilleté nos calendriers. « Proposons plutôt le jeudi prochain », ai-je suggéré. Elle l'a noté immédiatement."
          }
        ]
      },
      "de": {
        "subtitle": "Eine Planänderung",
        "storyNote": "Organisieren Sie geänderte Pläne problemlos neu.",
        "paragraphs": [
          {
            "id": "p48-1",
            "translation": "Es war mir unangenehm, es am Morgen selbst zu tun. \"Entschuldigung, es ist etwas zu Hause aufgekommen\", schrieb ich. Sie war verständnisvoll und sagte, kein Problem."
          },
          {
            "id": "p48-2",
            "translation": "Mein Morgen war plötzlich überbucht. \"Können wir die Besprechung um eine Stunde verschieben?\", fragte ich. Das Team stimmte ohne Probleme zu."
          },
          {
            "id": "p48-3",
            "translation": "Ich wollte bestätigen, bevor ich es festlegte. \"Passt Dienstag dir noch?\", fragte ich. Sie überprüfte und sagte, es sei perfekt."
          },
          {
            "id": "p48-4",
            "translation": "Mein Tag war völlig zusammengebrochen. \"Ich kann heute Abend nicht kommen\", sagte ich. Wir einigten uns darauf, es nächste Woche zu versuchen."
          },
          {
            "id": "p48-5",
            "translation": "Wir blätterten beide in unseren Kalendern. \"Nehmen wir stattdessen nächsten Donnerstag ins Visier\", schlug ich vor. Sie trug es sofort ein."
          }
        ]
      }
    }
  },
  {
    "storyId": 49,
    "translations": {
      "es": {
        "subtitle": "Día de mudanza",
        "storyNote": "Conversaciones ocupadas en el día de la mudanza.",
        "paragraphs": [
          {
            "id": "p49-1",
            "translation": "Pegué con cinta la última caja y miré alrededor de la habitación vacía. 'Nos mudamos a un lugar cerca del parque', dije. Finalmente se sentía real."
          },
          {
            "id": "p49-2",
            "translation": "Los mudadores pusieron el sofá justo en la puerta. '¿Dónde deberíamos poner la estantería?', pregunté. Ella señaló la pared junto a la ventana."
          },
          {
            "id": "p49-3",
            "translation": "Él levantó una caja marcada con una X roja. 'Ten cuidado con esa, es frágil', le advertí. Ralentizó el paso y la colocó suavemente."
          },
          {
            "id": "p49-4",
            "translation": "Miramos la montaña de cajas y suspiramos. 'Bueno, terminemos con esto de una vez', dije. Pusimos música y nos pusimos a trabajar."
          },
          {
            "id": "p49-5",
            "translation": "Las habitaciones lentamente comenzaban a parecer un hogar. 'Casi terminamos de desempacar la cocina', dije. Una caja más y finalmente podríamos descansar."
          }
        ]
      },
      "ja": {
        "subtitle": "引っ越しの日",
        "storyNote": "引っ越しの日の忙しい会話たち。",
        "paragraphs": [
          {
            "id": "p49-1",
            "translation": "最後の箱にテープを貼り、からっぽの部屋を見回した。'公園の近くに引っ越すんだ'と言った。やっと現実味が出てきた。"
          },
          {
            "id": "p49-2",
            "translation": "引っ越し業者がソファをドアの入口にぴったり置いた。'本棚はどこに置きましょう?'と聞いた。彼女は窓の横の壁を指した。"
          },
          {
            "id": "p49-3",
            "translation": "彼は赤いXマークが付いた箱を持ち上げた。'その箱は壊れやすいから気をつけてね'と警告した。彼は速度を落とし、そっと置いた。"
          },
          {
            "id": "p49-4",
            "translation": "段ボール箱の山を見つめてため息をついた。'よし、これで終わりにしよう'と言った。音楽をかけて、力を入れて片付けた。"
          },
          {
            "id": "p49-5",
            "translation": "部屋はゆっくりと家らしくなり始めていた。'キッチンの荷物解きもほぼ終わったよ'と言った。あと一箱で、やっと休める。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "搬家日",
        "storyNote": "搬家日的忙碌对话。",
        "paragraphs": [
          {
            "id": "p49-1",
            "translation": "我用胶带封好了最后一个箱子，环顾空荡荡的房间。'我们要搬到公园附近的地方去',我说。这一切终于感到真实了。"
          },
          {
            "id": "p49-2",
            "translation": "搬家工人把沙发放在了门口。'书柜应该放在哪里?',我问。她指了指窗边的墙。"
          },
          {
            "id": "p49-3",
            "translation": "他抬起一个标有红色X的箱子。'小心那个箱子，很易碎',我警告说。他放慢了速度，轻轻地把它放下。"
          },
          {
            "id": "p49-4",
            "translation": "我们盯着那堆箱子叹了口气。'好吧，我们赶紧完成吧',我说。我们放上音乐，加油干了起来。"
          },
          {
            "id": "p49-5",
            "translation": "房间慢慢开始像家的样子了。'厨房的东西基本上快拆完了',我说。再整理一个箱子，我们就能休息了。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "搬家日",
        "storyNote": "搬家日的忙碌對話。",
        "paragraphs": [
          {
            "id": "p49-1",
            "translation": "我用膠帶封好了最後一個箱子，環顧空蕩蕩的房間。'我們要搬到公園附近的地方去',我說。這一切終於感到真實了。"
          },
          {
            "id": "p49-2",
            "translation": "搬家工人把沙發放在了門口。'書櫃應該放在哪裡?',我問。她指了指窗邊的牆。"
          },
          {
            "id": "p49-3",
            "translation": "他抬起一個標有紅色X的箱子。'小心那個箱子，很易碎',我警告說。他放慢了速度，輕輕地把它放下。"
          },
          {
            "id": "p49-4",
            "translation": "我們盯著那堆箱子嘆了口氣。'好吧，我們趕緊完成吧',我說。我們放上音樂，加油幹了起來。"
          },
          {
            "id": "p49-5",
            "translation": "房間慢慢開始像家的樣子了。'廚房的東西基本上快拆完了',我說。再整理一個箱子，我們就能休息了。"
          }
        ]
      },
      "fr": {
        "subtitle": "Jour du déménagement",
        "storyNote": "Des conversations occupées lors du jour du déménagement.",
        "paragraphs": [
          {
            "id": "p49-1",
            "translation": "J'ai collé la dernière boîte et regardé autour de la pièce vide. 'Nous déménageons dans un endroit près du parc', ai-je dit. Cela commençait enfin à paraître réel."
          },
          {
            "id": "p49-2",
            "translation": "Les déménageurs ont placé le canapé directement dans l'embrasure de la porte. 'Où devrions-nous mettre la bibliothèque?', ai-je demandé. Elle a pointé le mur près de la fenêtre."
          },
          {
            "id": "p49-3",
            "translation": "Il a soulevé une boîte marquée d'une croix rouge. 'Attention avec celle-ci, elle est fragile', l'ai-je averti. Il a ralenti et l'a posée délicatement."
          },
          {
            "id": "p49-4",
            "translation": "Nous avons regardé la montagne de boîtes et soupiré. 'D'accord, finissons-en', ai-je dit. Nous avons mis de la musique et nous avons continué."
          },
          {
            "id": "p49-5",
            "translation": "Les pièces commençaient lentement à ressembler à un foyer. 'Nous avons presque fini de déballer la cuisine', ai-je dit. Une boîte de plus et nous pourrions enfin nous reposer."
          }
        ]
      },
      "de": {
        "subtitle": "Umzugstag",
        "storyNote": "Geschäftige Gespräche am Umzugstag.",
        "paragraphs": [
          {
            "id": "p49-1",
            "translation": "Ich klebte die letzte Schachtel zu und blickte mich im leeren Zimmer um. 'Wir ziehen an einen Ort in der Nähe des Parks', sagte ich. Es begann sich endlich real anzufühlen."
          },
          {
            "id": "p49-2",
            "translation": "Die Umzugshelfer stellten das Sofa direkt in die Türöffnung. 'Wo sollen wir das Bücherregal hinstellen?', fragte ich. Sie zeigte auf die Wand neben dem Fenster."
          },
          {
            "id": "p49-3",
            "translation": "Er hob eine mit einem roten X gekennzeichnete Schachtel an. 'Vorsicht damit, das ist zerbrechlich', warnte ich. Er verlangsamte seinen Schritt und stellte sie vorsichtig ab."
          },
          {
            "id": "p49-4",
            "translation": "Wir starrten auf den Berg von Schachteln und seufzten. 'Okay, machen wir schnell', sagte ich. Wir legten Musik auf und packten aus."
          },
          {
            "id": "p49-5",
            "translation": "Die Zimmer begannen langsam wie zu Hause auszusehen. 'Wir sind fast fertig mit dem Auspacken der Küche', sagte ich. Noch eine Schachtel und wir können uns endlich ausruhen."
          }
        ]
      }
    }
  },
  {
    "storyId": 50,
    "translations": {
      "es": {
        "subtitle": "Reparaciones y problemas del hogar",
        "storyNote": "Los daños siempre llegan de improviso.",
        "paragraphs": [
          {
            "id": "p50-1",
            "translation": "El radiador hizo un ruido metálico y no desprendía calor. «Algo anda mal con la calefacción», le dije al dueño. Me prometió que enviaría a alguien antes del mediodía."
          },
          {
            "id": "p50-2",
            "translation": "Se estaba acumulando agua bajo el fregadero de la cocina. «¿Puedes revisar la tubería?», le pregunté al plomero. Se agachó y se puso a trabajar."
          },
          {
            "id": "p50-3",
            "translation": "El ruido extraño nos había molestado durante días. «Ha estado haciendo un sonido de clic», expliqué. Asintió como si ya lo hubiera oído antes."
          },
          {
            "id": "p50-4",
            "translation": "La fuga empeoraba cada hora. «¿Cuándo puedes venir?», pregunté. Dijo que podía estar aquí dentro de una hora."
          },
          {
            "id": "p50-5",
            "translation": "El técnico se fue y aquella noche se rompió de nuevo. «Por supuesto, qué mala suerte», murmuré. Nos reímos porque no había nada más que hacer."
          }
        ]
      },
      "ja": {
        "subtitle": "修理と家の問題",
        "storyNote": "故障はいつも突然やってくるものです。",
        "paragraphs": [
          {
            "id": "p50-1",
            "translation": "ラジエーターがカタカタ音を立てて、暖が出ていなかった。「暖房が壊れています」と家主に言った。彼は昼までに誰かを送ると約束してくれた。"
          },
          {
            "id": "p50-2",
            "translation": "キッチンシンクの下に水が溜まっていた。「パイプを見てくれませんか?」と配管工に聞いた。彼はしゃがみ込んで仕事を始めた。"
          },
          {
            "id": "p50-3",
            "translation": "その奇妙な音は何日も私たちを悩ませていた。「クリッキング音がしているんです」と説明した。彼は前に聞いたことがあるような顔でうなずいた。"
          },
          {
            "id": "p50-4",
            "translation": "漏水はどんどん悪くなっていた。「どのくらいで来られますか?」と聞いた。彼は1時間以内に来られると言った。"
          },
          {
            "id": "p50-5",
            "translation": "修理の人が去った夜、また壊れてしまった。「もちろんだ、ついてない」とつぶやいた。何もできることがなかったので、私たちは笑った。"
          }
        ]
      },
      "zh-CN": {
        "subtitle": "维修和房屋问题",
        "storyNote": "故障总是突然降临。",
        "paragraphs": [
          {
            "id": "p50-1",
            "translation": "散热器发出咔咔声，没有散热。我对房东说：「暖气出了问题。」他答应在中午前派人来。"
          },
          {
            "id": "p50-2",
            "translation": "厨房水槽下面积着水。我问水管工：「你能看看这根管子吗?」他蹲下来开始工作。"
          },
          {
            "id": "p50-3",
            "translation": "这奇怪的声音困扰了我们好几天。我解释说：「它一直在发出咔哒声。」他点了点头，好像以前听过一样。"
          },
          {
            "id": "p50-4",
            "translation": "漏水情况每小时都在恶化。我问：「你什么时候能来?」他说他一小时内就能到。"
          },
          {
            "id": "p50-5",
            "translation": "修理工离开后，那晚它又坏了。我嘟囔道：「当然了，真倒霉。」我们笑了，因为除此之外别无他法。"
          }
        ]
      },
      "zh-TW": {
        "subtitle": "維修和房屋問題",
        "storyNote": "故障總是突然降臨。",
        "paragraphs": [
          {
            "id": "p50-1",
            "translation": "散熱器發出咔咔聲，沒有散熱。我對房東說：「暖氣出了問題。」他答應在中午前派人來。"
          },
          {
            "id": "p50-2",
            "translation": "廚房水槽下面積著水。我問水管工：「你能看看這根管子嗎?」他蹲下來開始工作。"
          },
          {
            "id": "p50-3",
            "translation": "這奇怪的聲音困擾了我們好幾天。我解釋說：「它一直在發出咔噠聲。」他點了點頭，好像以前聽過一樣。"
          },
          {
            "id": "p50-4",
            "translation": "漏水情況每小時都在惡化。我問：「你什麼時候能來?」他說他一小時內就能到。"
          },
          {
            "id": "p50-5",
            "translation": "修理工離開後，那晚它又壞了。我嘟囔道：「當然了，真倒楣。」我們笑了，因為除此之外別無他法。"
          }
        ]
      },
      "fr": {
        "subtitle": "Réparations et problèmes domestiques",
        "storyNote": "Les pannes arrivent toujours par surprise.",
        "paragraphs": [
          {
            "id": "p50-1",
            "translation": "Le radiateur faisait du bruit et ne chauffait pas. « Il y a un problème avec le chauffage », ai-je dit au propriétaire. Il a promis d'envoyer quelqu'un avant midi."
          },
          {
            "id": "p50-2",
            "translation": "L'eau s'accumulait sous l'évier de la cuisine. « Peux-tu jeter un œil au tuyau? » ai-je demandé au plombier. Il s'est accroupi et s'est mis au travail."
          },
          {
            "id": "p50-3",
            "translation": "Ce bruit étrange nous embêtait depuis des jours. « Il fait un bruit de clic », ai-je expliqué. Il a hoché la tête comme s'il l'avait entendu avant."
          },
          {
            "id": "p50-4",
            "translation": "La fuite s'aggravait d'heure en heure. « Quand peux-tu venir? » ai-je demandé. Il a dit qu'il pouvait être là dans l'heure."
          },
          {
            "id": "p50-5",
            "translation": "Le réparateur est parti et c'est cassé à nouveau cette nuit-là. « Bien sûr — pas de chance », ai-je marmonné. Nous avons ri parce qu'il n'y avait rien d'autre à faire."
          }
        ]
      },
      "de": {
        "subtitle": "Reparaturen und Hausprobleme",
        "storyNote": "Defekte kommen immer plötzlich.",
        "paragraphs": [
          {
            "id": "p50-1",
            "translation": "Der Heizkörper klapperte und gab keine Wärme ab. \"Mit der Heizung stimmt etwas nicht\", sagte ich zum Vermieter. Er versprach, bis Mittag jemanden vorbeizuschicken."
          },
          {
            "id": "p50-2",
            "translation": "Wasser staute sich unter dem Küchensink. \"Kannst du dir das Rohr ansehen?\" fragte ich den Klempner. Er hockte sich hin und machte sich an die Arbeit."
          },
          {
            "id": "p50-3",
            "translation": "Das seltsame Geräusch plagierte uns tagelang. \"Es macht ein Klickgeräusch\", erklärte ich. Er nickte, als hätte er es schon gehört."
          },
          {
            "id": "p50-4",
            "translation": "Das Leck wurde stündlich schlimmer. \"Wann kannst du kommen?\" fragte ich. Er sagte, er könnte innerhalb einer Stunde da sein."
          },
          {
            "id": "p50-5",
            "translation": "Der Reparateur ging und es brach in dieser Nacht wieder kaputt. \"Natürlich — einfach kein Glück\", murmelte ich. Wir lachten, weil es nichts anderes zu tun gab."
          }
        ]
      }
    }
  }
]