/**
 * owner : retrAIver
 * author : Manish from Affine
 */
import React, { useState, useEffect } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import { Checkbox, Panel, DefaultButton, TextField, SpinButton, Dropdown } from "@fluentui/react";
import ToolkitProvider, {
  Search,
} from "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import UploadDocumentComp from "./UploadDocumentComp";
import datasetService from "../../api/documentService";
import { trackPromise } from "react-promise-tracker";
import { DateTimeFormatter, getSizeinKB } from "../../utils";
import Modal from "react-bootstrap/Modal";
import categoryService from "../../api/categoryService";
import LoadingOverlay from "../../components/LoadingOverlay/LoadingOverlay";
import useCredit from "../../api/userCredit";
import "./DocumentsList.scss"

const pagination = paginationFactory({
  page: 1,
  sizePerPage: 10,
  lastPageText: ">>",
  firstPageText: "<<",
  nextPageText: ">",
  prePageText: "<",
  showTotal: true,
  alwaysShowAllBtns: true,
  hideSizePerPage: false,
});

const { SearchBar } = Search;

function DocumentsList() {
  const [showAddDataset, setShowAddDataset] = useState(false);
  const [loading, setLoading] = useState(true);
  const [datasetsList, setDatasetsList] = useState([]);
  const [filteredDatasetsList, setFilteredDatasetsList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [categoryList, setcategoryList] = useState([]);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [isDisabled, setDisabled] = useState(false);
  const [modaltext, setText] = useState("");
  const [loaderMessage, setLoaderMessage] = useState("Fetching uploaded files...")
  const pageSize = 10;

  const { creditBalance, setCreditBalance } = useCredit();

  const getData = () => {
    // helper.checkLicense().then((res)=>{
    //    if (res !== "passed"){
    //      handleShow()
    //      setDisabled(true)
    //      setText(res)
    //    }
    // })
  };

  function getDocHeight() {
    var D = document;
    return Math.max(
      D.body.scrollHeight,
      D.documentElement.scrollHeight,
      D.body.offsetHeight,
      D.documentElement.offsetHeight,
      D.body.clientHeight,
      D.documentElement.clientHeight
    );
  }
  useEffect(() => {
    if (window.innerWidth <= 768) {
      window.addEventListener("scroll", onScroll);
    }

    return () => {
      if (window.innerWidth <= 768) {
        window.removeEventListener("scroll", onScroll);
      }
    };
  }, [datasetsList, filteredDatasetsList]);

  const onScroll = () => {
    if (datasetsList.length > filteredDatasetsList.length) {
      var winheight =
        window.innerHeight ||
        (document.documentElement || document.body).clientHeight;
      var docheight = getDocHeight();
      var scrollTop = (
        document.documentElement ||
        document.body.parentNode ||
        document.body
      ).scrollTop;
      var trackLength = docheight - winheight;
      var pctScrolled = Math.floor((scrollTop / trackLength) * 100);
      if (!isNaN(pctScrolled)) {
        if (pctScrolled > 90) {
          if (searchText != "") {
            let lowerVal = searchText.toLowerCase();
            let results = datasetsList.filter(
              (data) =>
                data.category.toLowerCase().includes(lowerVal) ||
                data.fileName.toLowerCase().includes(lowerVal) ||
                data.uploadedBy.toLowerCase().includes(lowerVal)
            );
            if (results.length > filteredDatasetsList.length) {
              setFilteredDatasetsList(
                results
              );
            }
          } else {
            setFilteredDatasetsList([
              ...datasetsList
            ]);
          }
        }
      }
    }
  };

  //useEffect(() => {
  //  getData();
  //}, []);

  window.addEventListener("unload", (event) => {
    getData();
  });

  useEffect(() => {
    getCategory();
  }, []);

  useEffect(() => {
    if (categoryList.length > 0) {
      getAllDocuments();
    }

  }, [categoryList]);

  /**
   * get All Documents List from db
   */
  const getAllDocuments = () => {
    setLoaderMessage("Fetching uploaded files...")
    setLoading(true);
    const user_info = { email: localStorage.getItem("email") }
    trackPromise(
      datasetService.getAllDocuments(user_info)
        .then((response) => {
          const temp = [...response.data.Files].map((dataset, index) => ({
            ...dataset,
            id: index + 1,
            category: categoryList.filter((catg) => catg.id == dataset.category_id)?.[0]?.category_name,
            status: dataset.status ? "Indexed" : "Uploaded",
            action: (
              <div className="actionicons">
                {/* <i className="fa-solid fa-trash text-danger" title="Delete Document"  onClick={() => deleteDoc(dataset.fileId)}></i>  */}
              </div>
            ),
          }));
          const final_data = temp.filter((catg) => catg.category != undefined)
          setDatasetsList(final_data);
          setFilteredDatasetsList(final_data);
          setCreditBalance(response.data.balance);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          alert(err.response.data.error);
        })
    );
  };
  const getCategory = () => {
    trackPromise(
      categoryService
        .getCategory({ status_flag: 1 })
        .then((res) => {
          setcategoryList(res.data.CategoryList);
        })
        .catch((err) => console.log(err))
    );
  };
  const _onButtonClick = () => {
    setShowAddDataset(true);
  };

  const clearState = (datasetName) => {
    setShowAddDataset(false);
    if (datasetName) {
      getAllDocuments();
    }
  };

  const filterResultsBySearch = (val) => {
    setSearchText(val);
    let lowerVal = val.toLowerCase();
    if (lowerVal == "") {
      setFilteredDatasetsList(datasetsList);
    } else {
      let results = datasetsList
        .filter(
          (data) =>
            data.category.toLowerCase().includes(lowerVal) ||
            data.file_name.toLowerCase().includes(lowerVal) ||
            data.uploaded_by.toLowerCase().includes(lowerVal)
        )
      setFilteredDatasetsList(results);
    }
  };


  const deleteDocs = (chunk_ids, file_name) => {
    // Remove single quotes and square brackets
    const correctedString = chunk_ids.replace(/[\[\]']/g, '');

    // Split the string into an array
    const chunkIds = correctedString.split(', ').map(id => id.trim());


    let confirmDelete = window.confirm("Are you sure you want to delete these documents?");

    if (confirmDelete) {
      setLoaderMessage("Deleting file...")
      setLoading(true);
      trackPromise(
        datasetService
          .deleteDocument(chunkIds, file_name)
          .then((response) => {
            alert(response.data);
            getAllDocuments();
            setLoading(false);
          })
          .catch((err) => {
            setLoading(false);
            alert(err.response.data.message);
          })
      );
    }
  };

  const _onRefreshClick = () => {
    getAllDocuments();
  };


  const columns = [
    {
      dataField: "id",
      text: "#",
      sort: true,
      headerAlign: "left",
      align: "left",
    },
    {
      dataField: "file_name",
      text: "File Name",
      sort: true,
      headerAlign: "left",
      align: "left",
    },
    {
      dataField: "uploaded_at",
      text: "Uploaded On",
      formatter: (cell) => DateTimeFormatter(cell),
      sort: true,
      headerAlign: "left",
      align: "left",
    },
    {
      dataField: "uploaded_by",
      text: "Uploaded By",
      sort: true,
      headerAlign: "left",
      align: "left",
    },
    {
      dataField: "file_size",
      text: "Size",
      sort: true,
      formatter: (cell) => getSizeinKB(cell),
      headerAlign: "left",
      align: "left",
    },
    { dataField: "category", text: "Category", sort: false, headerAlign: "left", align: "left" },
    {
      dataField: "remarks",
      text: "Remarks",
      sort: false,
      headerAlign: "left",
      align: "left",
    },
    {
      dataField: "status",
      text: "Index Status",
      sort: true,
      headerAlign: "left",
      align: "left",
    },
    {
      dataField: "id",
      text: <div style={{ textAlign: 'center' }}>Action</div>,
      formatter: (cell, row) => (
        <div style={{ textAlign: 'center' }}>
          <i
            className="fas fa-trash action-icon"
            title="Delete"
            style={{ cursor: 'pointer' }}
            onClick={() => deleteDocs(row.chunk_ids, row.file_name
            )} // Pass the chunk_id as an argument
          ></i>
        </div>
      ),
    }

  ];




  return (
    <div>
      {loading && <LoadingOverlay message={loaderMessage} />}
      <ToolkitProvider
        bootstrap4
        keyField="id"
        data={filteredDatasetsList}
        columns={columns}
        search
        bordered={false}
      >
        {(props) => (
          <div className="App">
            {showAddDataset && (
              <UploadDocumentComp
                clearState={(datasetName) => clearState(datasetName)}
                getAllDocuments={() => getAllDocuments()}
                categoryList={categoryList.filter(
                  (category) => category.status === 1
                )}
              />
            )}
            <div className="container-fluid">
              <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
              >
                <Modal.Header closeButton>
                  <Modal.Title>License Validation Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {modaltext}, Please connect at{" "}
                  <a href="mailto:retreaiveractivation@affine.ai">
                    Affine Admin
                  </a>
                </Modal.Body>
              </Modal>
              <div className="row">
                <div className="">
                  <div className="mt-3 documentheader">
                    <div className="text1">Documents</div>
                    <div className="text1 serach-cls">
                      <SearchBar
                        placeholder="Search Documents"
                        {...props.searchProps}
                        onSearch={(val) => {
                          filterResultsBySearch(val);
                        }}
                        searchText={searchText}
                      />
                      <i
                        className="fa-solid fa-magnifying-glass fa-search-icon"
                        title="Search"
                      ></i>
                    </div>
                    <div className="adddataset-btn-div">
                      <Button
                        className="adddataset-btn"
                        variant="primary"
                        onClick={_onRefreshClick}
                        hidden={isDisabled}
                      >
                        <i className="fa fa-refresh me-2" title="Refresh"></i>
                        Refresh
                      </Button>

                      <Button
                        className="adddataset-btn"
                        variant="primary"
                        onClick={_onButtonClick}
                        hidden={isDisabled}
                      >
                        <i
                          className="fa fa-upload me-2"
                          title="Upload File"
                        ></i>
                        Upload Files
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mobilelist">
                {filteredDatasetsList.map((doc) => {
                  return (
                    <Card style={{ marginTop: "16px" }}>
                      <Card.Body className="custom_card">
                        {columns.map((eachCol) => {
                          return (
                            <div
                              className="row"
                              style={{ marginBottom: "8px" }}
                            >
                              <div className="col-4">
                                <h6>{eachCol.text}</h6>
                              </div>
                              <div className="col-8">
                                <h6>{doc[eachCol.dataField]}</h6>
                              </div>
                            </div>
                          );
                        })}
                      </Card.Body>
                    </Card>
                  );
                })}
              </div>
              <div className="row">
                <div className="col">
                  <div>
                    <Card className="card2">
                      {
                        <Card.Body className="documentstable table-container list-view">
                          <BootstrapTable
                            keyField="datasetName"
                            pagination={pagination}
                            {...props.baseProps}
                            bordered={false}
                            noDataIndication={loading ? "Loading..." : "No Documents"}
                          />
                        </Card.Body>
                      }
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ToolkitProvider>
    </div>
  );
}

export default DocumentsList;
