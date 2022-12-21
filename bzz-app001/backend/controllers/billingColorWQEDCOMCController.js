var sql = require("mssql");
const methods = require("./crudController");
const endpoints = methods.crudController("WQEDCOMC");

delete endpoints["read"];
delete endpoints["update"];

const Model = "ColorWQEDCOMC";
endpoints.read = async (req, res) => {
  const { id} = req.params;

  try {
   
    const { recordset } = await sql.query(
      `SELECT * FROM ${Model} WHERE EMPID = ${id}`
    );


    return res.status(200).json({
      success: true,
      result: recordset,
      message: "Successfully found billing Color where EMPID  = ${id} ",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      params: req.params,
      query: `SELECT * FROM BillingColor WHERE EMPID = ${id}`,
      error: err,
    });
  }
};


endpoints.create = async (req, res) => {
  const {EMPID, User, Color1,Color2, Color3, Color4,Color5,Color6, Category1, Category2, Category3, Category4, Category5, Category6 } = req.body;
  try {
   
    const result = await sql.query(
      `Insert into ${Model} ("User", "EMPID", "Color1", "Color2", "Color3", "Color4", "Color5", "Color6", "Category1", "Category2", "Category3", "Category4", "Category5", "Category6" ) Values ('${User}', ${EMPID}, '${Color1}', '${Color2}', '${Color3}', '${Color4}', '${Color5}' ,'${Color6}' , '${Category1}', '${Category2}', '${Category3}', '${Category4}', '${Category5}', '${Category6}'  )`
    );

    return res.status(200).json({
      success: true,
      result: result,
      message: "Successfully found billing Color where EMPID  = ${id} ",
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is error",
      params: req.params,
      query: ` * FROM BillingColor WHERE EMPID = ${id}`,
      error: err,
    });
  }
};



endpoints.update = async (req, res) => {
  try {
    // Find document by id and updates with the required fields
    const values = req.body;
    const { id } = req.params;
    let valuesQuery = "";
    for (key in values) {
      if (values[key] === "null") {
        valuesQuery += key + "= NULL" + ",";
      } else {
        valuesQuery += key + "='" + values[key] + "',";
      }
    }

    valuesQuery = valuesQuery.slice(0, -1);

    await sql.query(`update ${Model} set ${valuesQuery} where EMPID = ${id}`);

    return res.status(200).json({
      success: true,
      result: {},
      message: "we update this document by this id: " + req.params.id,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: "Oops there is an Error",
      error: err,
    });
  }
};

module.exports = endpoints;