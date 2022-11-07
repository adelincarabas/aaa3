sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/Table",
  ],
  function (
    BaseController,
    JSONModel,
    formatter,
    Filter,
    FilterOperator,
    MessageToast,
    Table
  ) {
    "use strict";

    return BaseController.extend("breadcrumbui.controller.Worklist", {
      formatter: formatter,

      /* =========================================================== */
      /* lifecycle methods                                           */
      /* =========================================================== */

      /**
       * Called when the worklist controller is instantiated.
       * @public
       */
      onInit: function () {
        this.level = 1;
        this.byId("breadcrumbList2").setVisible(false);
        // this.byId("breadcrumbList").setVisible(false);
        this.g = 2;
        var oViewModel;
        this.i = 0;

        // keeps the search state
        this._aTableSearchState = [];

        // Model used to manipulate control states
        oViewModel = new JSONModel({
          worklistTableTitle:
            this.getResourceBundle().getText("worklistTableTitle"),
          shareSendEmailSubject: this.getResourceBundle().getText(
            "shareSendEmailWorklistSubject"
          ),
          shareSendEmailMessage: this.getResourceBundle().getText(
            "shareSendEmailWorklistMessage",
            [location.href]
          ),
          tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
        });
        this.setModel(oViewModel, "worklistView");

        var oPageModel = new sap.ui.model.json.JSONModel({
          arrayForTreeTable: [],
        });

        this.getView().setModel(oPageModel, "treeTableJSON");

        // this.byId("breadcrumbList").setVisible(true);
      },

      /* =========================================================== */
      /* event handlers                                              */
      /* =========================================================== */

      /**
       * Triggered by the table's 'updateFinished' event: after new table
       * data is available, this handler method updates the table counter.
       * This should only happen if the update was successful, which is
       * why this handler is attached to 'updateFinished' and not to the
       * table's list binding's 'dataReceived' method.
       * @param {sap.ui.base.Event} oEvent the update finished event
       * @public
       */
      onUpdateFinished: function (oEvent) {
        // update the worklist's object counter after the table update
        var sTitle,
          oTable = oEvent.getSource(),
          iTotalItems = oEvent.getParameter("total");
        // only update the counter if the length is final and
        // the table is not empty
        if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
          sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [
            iTotalItems,
          ]);
        } else {
          sTitle = this.getResourceBundle().getText("worklistTableTitle");
        }
        this.getModel("worklistView").setProperty(
          "/worklistTableTitle",
          sTitle
        );
      },

      /**
       * Event handler when a table item gets pressed
       * @param {sap.ui.base.Event} oEvent the table selectionChange event
       * @public
       */
      onPress: function (oEvent) {
        // The source is the list item that got pressed
        this._showObject(oEvent.getSource());
      },

      /**
       * Event handler for navigating back.
       * Navigate back in the browser history
       * @public
       */
      onNavBack: function () {
        // eslint-disable-next-line sap-no-history-manipulation
        history.go(-1);
      },

      /**
       * Event handler for refresh event. Keeps filter, sort
       * and group settings and refreshes the list binding.
       * @public
       */
      onRefresh: function () {
        var oTable = this.byId("table");
        oTable.getBinding("items").refresh();
      },

      /* =========================================================== */
      /* internal methods                                            */
      /* =========================================================== */

      /**
       * Shows the selected item on the object page
       * @param {sap.m.ObjectListItem} oItem selected Item
       * @private
       */
      _showObject: function (oItem) {
        this.getRouter().navTo("object", {
          objectId: oItem
            .getBindingContext()
            .getPath()
            .substring("/breadcrumb1".length),
        });
      },

      handleChange: function (oEvent) {
        let dTableSearchState = [];
        let andTableSearch = [];
        let andComboBoxSearch = [];
        var oCombo = this.byId("combobox1");
        this.comboSelected = oCombo._lastValue;
        var oMultiCombo = this.byId("multicombo");
        var oBindingMultiCombo = oMultiCombo.getBinding("items");

        console.log("log smth");
        if (this.selectedLength === undefined || this.selectedLength === 0) {
          dTableSearchState = [
            new Filter("Object_Type", FilterOperator.EQ, oCombo._lastValue),
          ];
          andTableSearch.push(dTableSearchState[0]);
          let orTableSearch = new Filter({ filters: andTableSearch, or: true });
          oBindingMultiCombo.filter(orTableSearch);
        } else {
          for (let i = 0; i < this.selectedLength; i++) {
            // console.log(this.selectedItems[i].mProperties);
            var oFilterSingle = new Filter({
              filters: [
                new Filter(
                  "Key_Name",
                  FilterOperator.EQ,
                  this.selectedItems[i]
                ),
                new Filter("Object_Type", FilterOperator.EQ, oCombo._lastValue),
              ],
              or: true,
            });
            andComboBoxSearch.push(oFilterSingle);
          }
          this.orComboBoxSearch = new Filter({
            filters: andComboBoxSearch,
            or: true,
          });
          oBindingMultiCombo.filter(this.orComboBoxSearch);
        }
      },

      handleSelectionChange: function (oEvent) {
        var changedItem = oEvent.getParameter("changedItem");
        this.isSelected = oEvent.getParameter("selected");

        var state = "Selected";
        if (!this.isSelected) {
          state = "Deselected";
        }

        MessageToast.show(
          "Event 'selectionChange': " +
            state +
            " '" +
            changedItem.getText() +
            "'",
          {
            width: "auto",
          }
        );
        this.i++;
        // this.byId("breadcrumbList").setVisible(true);
      },

      handleSelectionFinish: async function (oEvent) {
        var selectedItems = oEvent.getParameter("selectedItems");
        let arrayItemsSelected = [];
        this.selectedItems = [];
        this.selectedLength = selectedItems.length;
        for (let i = 0; i < selectedItems.length; i++) {
          arrayItemsSelected.push(selectedItems[i].getText());
          this.selectedItems.push(selectedItems[i].getText());
        }
        // console.log(arrayItemsSelected);
        let what;
        if (arrayItemsSelected.length > 1) {
          what = arrayItemsSelected.join(",");
          // console.log(what);
        } else if (arrayItemsSelected.length == 1) {
          what = arrayItemsSelected.join("");
          // console.log(what);
        }

        var that = this;

        const oContext = this.getView()
          .byId("TreeTableBasic")
          .getParent()
          .getObjectBinding("catalogModel");

        oContext.setParameter("a", what);

        // oContext.execute().catch((e) => {
        //   console.log(e);
        // });

        // oContext.execute().then(
        //   function () {
        //     console.log(oContext.getBoundContext().getObject());
        //   }.bind(this)
        // );

        await oContext.execute();

        let oActionContext = oContext.getBoundContext().getObject();

        let JSONForTreeTable = [];
        for (let i = 0; i < oActionContext.value.categories.length; i++) {
          JSONForTreeTable.push(oActionContext.value.categories[i]);
        }

        this.getView().getModel("treeTableJSON").getData().arrayForTreeTable =
          JSONForTreeTable;

        this.getView().getModel("treeTableJSON").refresh();

        //stringify in prima parte
        //TREBUIE JSON PARSE
      },

      onSave: async function () {
        await new Promise((r) => setTimeout(r, 1000));
        // this.byId("breadcrumbList").setVisible(true);
      },
    });
  }
);
