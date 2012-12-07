//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//http://music.geocities.jp/kreisler_liebesleid/java/JDBC/SwingJDBC2.html
//Swing JDBC アプリケーション
//JDBCSwingQuery XEAD Driver Rhino へ書き換え 2012-12-05 SHIMOYAMA Yoshihiro 
//起動方法　CドライブにRhinoフォルダを作成、js.jar、postgresql-9.2-1002.jdbc4.jarをおく
//コマンドプロンプトで
//cd c:\JDBCSwingQuery
//java -classpath .;js.jar;postgresql-9.2-1002.jdbc4.jar org.mozilla.javascript.tools.shell.Main -w -debug JDBCSwingQuery.js
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

importPackage(java.awt);
importPackage(javax.swing);
importPackage(javax.swing.table);
importPackage(java.sql);
importPackage(java.util);


////////////////////////
// JDBCSwingQuery表示 //
////////////////////////

var obj = new JDBCSwingQuery();


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////// S U B R O U T I N E S /////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////
//        JDBCSwingQuery       //
/////////////////////////////////
function JDBCSwingQuery() {


	strsql = setSqlString();				// ダミーのSQLをセットする


	try {
		persistMgr = new PersistenceManager();
		rs = persistMgr.executeSQL(strsql);
		model = new DataModel(rs);
	} catch (e) {
		JOptionPane.showMessageDialog(null, e);
		return;
	}

	//////////////////////////
	// ダイアログ要素の設定 //
	//////////////////////////

    f = new JFrame() ;
	table = new JTable();
	table.setModel(model);
	scrollpane = new JScrollPane(table);

	// コンポーネントの作成
	queryField = new JTextField(strsql);
	queryButton = new JButton("Submit");
	panel = new JPanel();
	panel.setLayout(new GridLayout(2, 1));
	panel.add(queryField);
	panel.add(queryButton);

	// コンテント・ペインの取得
	cont = f.getContentPane();

	// コンテント・ペインに追加
	cont.add(panel, BorderLayout.NORTH);
	cont.add(scrollpane, BorderLayout.CENTER);

	// JFrame の作成
	f.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
 	f.setTitle("JDBCSwingQuery");
	f.pack();
    f.setVisible(true);

	////////////////////////
	// イベント、再クエリ //
	////////////////////////
	queryButton.addActionListener(function(){
	strsql = queryField.getText();
	try {
		rs = persistMgr.executeSQL(strsql);
		model = new DataModel(rs);
	} catch (e) {
		JOptionPane.showMessageDialog(null, e);
		return;
	}
	table.setModel(model); 
   });
}

/////////////////////////////////
//      PersistenceManager     //
/////////////////////////////////

function PersistenceManager() {
var conn;
	var stmt;
	var SQL = "";
	try {
		// データベースへの接続

	    java.lang.Class.forName("org.postgresql.Driver");
	    conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/skeleton", "postgres", "password");

	    stmt = conn.createStatement();

	} catch (e) {
	    JOptionPane.showMessageDialog(null, e);
    }

    this.executeSQL = function(str){
		try {
			if (stmt.execute(str)) {
				// SQL ステートメントの発行
				SQL = str;
				return stmt.getResultSet();
			} else {
				return stmt.executeQuery(SQL);
			}
		} catch (e) {
		JOptionPane.showMessageDialog(null, e);
		return stmt.executeQuery(SQL);
	    }
	}

    this.dbClose = function() {
		  //データベースを切断する
		  conn.Close();
		  conn = null;
    }
}

/////////////////////////////////
//          DataModel          //
/////////////////////////////////

function DataModel(rset) {
	var metaData;
	var columnNames;
	var rows;
	var numberOfColumns;
	var numberOfRows;

	metaData = rset.getMetaData();	// ResultSetのメタデータの取得
	numberOfColumns =  metaData.getColumnCount();	// 列数を取得

	columnNames = new Vector();	// 列名を保持するベクトル
	for(column = 0; column < numberOfColumns; column++) {
		 columnNames.addElement(metaData.getColumnLabel(column + 1));	// 列名を取得
		//	 javax.swing.JOptionPane.showMessageDialog(null, metaData.getColumnLabel(column + 1));
	}
	rows = new Vector();	// ResultSet全体のデータを保持するベクトル
	while (rset.next()) {
		newRow = new Vector();	// ResultSetの一行分のデータを保持するベクトル
		for ( i = 1; i <= numberOfColumns; i++) {
			newRow.addElement(rset.getObject(i));	// 各データを取得し追加
		}
		rows.addElement(newRow);	// 各行を追加
	}
	numberOfRows = rows.size();

	//JOptionPane.showMessageDialog(null, numberOfRows + "レコード取得しました。");

	//TableModelインターフェースとは
    //http://www.javadrive.jp/tutorial/jtable/index7.html
	//DefaultTableModel(Vector data, Vector columnNames)
	//DefaultTableModel を構築し、data と columnNames を setDataVector メソッドに渡すことにより、テーブルを初期化します
	model = new DefaultTableModel(rows, columnNames);
    return model;
}


/////////////////////////////////
//         setSqlString        //
/////////////////////////////////
function setSqlString() {
var strSQL = "\
select * from zt051 ;"
 return strSQL;
}
