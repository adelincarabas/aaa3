module.exports = async (srv) => {
  srv.on("calc", async (req) => {
    const tx = cds.transaction(req);
    let linkParameter = req.data.a;
    let level = 1;
    let completFinalResult = [];
    let technicalProcess = [];

    var parameterArray = linkParameter.split(",");

    for (let y = 0; y < parameterArray.length; y++) {
      level = 1;
      technicalProcess = [];

      let technicalObjectFilter = [];
      let technicalObjectOwnerShip_Table = await tx.run([
        SELECT.from("APP_DEV_TOOLS_TECHNICAL_OBJECT_OWNERSHIP"),
      ]);
      let technicalObjectOwnerShip_Table_Flat =
        technicalObjectOwnerShip_Table.flat(5);

      for (let t = 0; t < technicalObjectOwnerShip_Table_Flat.length; t++) {
        if (
          technicalObjectOwnerShip_Table_Flat[t].TECHNICAL_OBJECT ===
          parameterArray[y]
        ) {
          technicalProcess.push(
            technicalObjectOwnerShip_Table_Flat[t].TECHNICAL_PROCESS
          );
        }
      }

      let technicalObjectDependency_Table = await tx.run([
        SELECT.from("APP_DEV_TOOLS_TECHNICAL_PROCESS_DEPENDENCY"),
      ]);

      let technicalObjectDependency_Table_Flat =
        technicalObjectDependency_Table.flat(5);

      let input = technicalProcess[0].toUpperCase();

      for (let o = 0; o < technicalObjectDependency_Table_Flat.length; o++) {
        if (
          technicalObjectDependency_Table_Flat[o]
            .DEPENDING_ON_TECHNICAL_PROCESS === input
        ) {
          technicalObjectFilter.push(technicalObjectDependency_Table_Flat[o]);
          technicalObjectFilter[
            technicalObjectFilter.length - 1
          ].KEY = `LEVEL ${level}`;
          technicalObjectFilter[
            technicalObjectFilter.length - 1
          ].TECHNICAL_OBJECT = parameterArray[y];
        }
      }

      level++;
      let result1Actually = technicalObjectFilter.flat(5);
      let i = 1;
      let evenLevelArray = [];
      let oddLevelArray = [];
      let b = 0;
      let length1 = 0;
      let length2 = 0;
      let result4 = [];
      while (b == 0) {
        for (let o = 0; o < technicalObjectFilter.length; o++) {
          for (
            let r = 0;
            r < technicalObjectDependency_Table_Flat.length;
            r++
          ) {
            if (
              technicalObjectDependency_Table_Flat[r]
                .DEPENDING_ON_TECHNICAL_PROCESS ===
              technicalObjectFilter[o].TECHNICAL_PROCESS
            ) {
              result4.push(technicalObjectDependency_Table_Flat[r]);
              evenLevelArray.push(technicalObjectDependency_Table_Flat[r]);
              evenLevelArray[evenLevelArray.length - 1].KEY = `LEVEL ${level}`;
              evenLevelArray[evenLevelArray.length - 1].TECHNICAL_OBJECT =
                parameterArray[y];
            }
          }
        }

        // evenLevelArray = evenLevelArray.filter(
        //   (v, i, a) =>
        //     a.findIndex(
        //       (v2) =>
        //         v2.DEPENDING_ON_TECHNICAL_PROCESS ===
        //           v.DEPENDING_ON_TECHNICAL_PROCESS &&
        //         v2.TECHNICAL_PROCESS === v.TECHNICAL_PROCESS
        //     ) === i
        // );

        if (evenLevelArray.length == length1) {
          b = 1;
        } else {
          level++;
        }
        length1 = evenLevelArray.length;

        for (let o = 0; o < result4.length; o++) {
          for (
            let r = 0;
            r < technicalObjectDependency_Table_Flat.length;
            r++
          ) {
            if (
              technicalObjectDependency_Table_Flat[r]
                .DEPENDING_ON_TECHNICAL_PROCESS === result4[o].TECHNICAL_PROCESS
            ) {
              oddLevelArray.push(technicalObjectDependency_Table_Flat[r]);
              oddLevelArray[oddLevelArray.length - 1].KEY = `LEVEL ${level}`;
              oddLevelArray[oddLevelArray.length - 1].TECHNICAL_OBJECT =
                parameterArray[y];
            }
          }
        }

        result4 = [];
        oddLevelArray = oddLevelArray.flat(5);

        i++;
        if (oddLevelArray.length == length2) {
          b = 1;
        } else {
          level++;
        }
        length2 = oddLevelArray.length;
        technicalObjectFilter = oddLevelArray;
      }

      oddLevelArray = oddLevelArray.concat(evenLevelArray, result1Actually);

      oddLevelArray = oddLevelArray.filter(
        (v, i, a) =>
          a.findIndex(
            (v2) =>
              v2.DEPENDING_ON_TECHNICAL_PROCESS ===
                v.DEPENDING_ON_TECHNICAL_PROCESS &&
              v2.TECHNICAL_PROCESS === v.TECHNICAL_PROCESS
          ) === i
      );

      completFinalResult.push(oddLevelArray);
      technicalProcess = [];
    }
    // console.log(completFinalResult.flat(5));
    //pana aici ar trebui sa fie gata;
    let JSONForTreeTable = completFinalResult.flat(5);

    let technicalObjects = [];

    for (let z = 0; z < JSONForTreeTable.length; z++) {
      technicalObjects.push(JSONForTreeTable[z].TECHNICAL_OBJECT);
    }

    let uniqueArrayOfTechnicalObjects = technicalObjects.filter(function (
      item,
      pos
    ) {
      return technicalObjects.indexOf(item) == pos;
    });

    var groupBy = function (xs, key) {
      return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    };

    let resultArray2 = groupBy(JSONForTreeTable, "TECHNICAL_OBJECT");
    // return completFinalResult.flat(5);
    // console.log(resultArray2);

    // console.log(resultArray2[uniqueArrayOfTechnicalObjects[0]]);
    let newResult = [];
    // console.log(resultArray2.uniqueArrayOfTechnicalObjects[0].toString());
    for (let u = 0; u < uniqueArrayOfTechnicalObjects.length; u++) {
      resultArray2[uniqueArrayOfTechnicalObjects[u]] = {
        TECHNICAL_OBJECT: uniqueArrayOfTechnicalObjects[u],
        categories: resultArray2[uniqueArrayOfTechnicalObjects[u]],
      };
      newResult.push(resultArray2[uniqueArrayOfTechnicalObjects[u]]);
    }

    for (var i = 0; i < JSONForTreeTable.length; i++) {
      if (JSONForTreeTable[i].KEY === "LEVEL 1") {
        JSONForTreeTable[i].TECHNICAL_OBJECT =
          JSONForTreeTable[i].DEPENDING_ON_TECHNICAL_PROCESS;
      }
    }

    let wow = { categories: newResult };

    let finalResult = [];

    // console.log(lol);
    for (let o = 0; o < wow.categories.length; o++) {
      for (let i = 0; i < wow.categories[o].categories.length; i++) {
        wow.categories[o].categories[i].categories = [];
        // console.log(lol.AP_INPUT_HEADERS.categories[i]);
      }

      const filteredBooks = wow.categories[o].categories.filter((val) =>
        val.KEY.includes("LEVEL 1")
      );
      const ade = filteredBooks;

      sparc_ap = {
        TECHNICAL_OBJECT: `${wow.categories[o].TECHNICAL_OBJECT}`,
        categories: ade,
      };
      // console.log(filteredBooks);

      let level1TechnicalProcess = [];
      let b = 0;
      let level2 = [];

      // while (filteredBooks.length !== 0) {

      console.log();

      function level1(Books) {
        for (let i = 0; i < Books.length; i++) {
          let filteredBooks2 = wow.categories[o].categories.filter(
            (val) =>
              val.DEPENDING_ON_TECHNICAL_PROCESS === Books[i].TECHNICAL_PROCESS
          );

          if (filteredBooks2.length > 0) {
            level1TechnicalProcess.push(filteredBooks2);
          }
        }
      }
      // console.log(level1TechnicalProcess);

      function level3(object) {
        for (let j = 0; j < object.categories.length; j++) {
          for (let i = 0; i < level1TechnicalProcess.length; i++) {
            for (let z = 0; z < level1TechnicalProcess[i].length; z++) {
              if (
                object.categories[j].TECHNICAL_PROCESS ===
                level1TechnicalProcess[i][z].DEPENDING_ON_TECHNICAL_PROCESS
              ) {
                level2.push(level1TechnicalProcess[i][z]);
                object.categories[j].categories.push(
                  level1TechnicalProcess[i][z]
                );
              }
            }
          }
        }
        level1TechnicalProcess = [];
      }

      level1(filteredBooks);
      level3(sparc_ap);

      // console.log(sparc_ap.categories);

      // console.log(sparc_ap.categories.length);

      // console.log(ade1);
      // console.log("stop");
      // console.log(ade2);

      for (let y = 0; y < sparc_ap.categories.length; y++) {
        let ade1 = sparc_ap.categories[y].categories;
        let ade2 = sparc_ap.categories[y];
        while (ade1.length !== 0) {
          for (let i = 0; i < ade1.length; i++) {
            ade1[i].TECHNICAL_OBJECT = ade2.TECHNICAL_PROCESS;
          }
          level1(ade1);
          level3(ade2);

          ade1 = ade1[0].categories;

          if (sparc_ap.categories[y].categories) {
            for (let w = 0; w < sparc_ap.categories[y].categories.length; w++) {
              let ade1 = sparc_ap.categories[y].categories[w].categories;
              let ade2 = sparc_ap.categories[y].categories;
              console.log(ade1);
              console.log(ade2);

              for (
                let i = 0;
                i < sparc_ap.categories[y].categories[w].categories.length;
                i++
              ) {
                sparc_ap.categories[y].categories[w].categories[
                  i
                ].TECHNICAL_OBJECT =
                  sparc_ap.categories[y].categories[w].TECHNICAL_PROCESS;
              }
            }
          }

          // console.log(ade1);
          // console.log("Am trecuta odata");
        }
      }

      // console.log("am iesit boss");

      // console.log(sparc_ap);
      // console.log("what");
      finalResult.push(sparc_ap);
    }
    // console.log(finalResult);

    finalResult = { categories: finalResult };
    return finalResult;
  });
};
