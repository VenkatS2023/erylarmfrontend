/**
 * owner : retrAIver
 * author : Manish from Affine
 */
//import api from "./interceptor";
import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  headers: { "Content-Type": "application/json" },
});

class documentService {
  uploadFiles(email, file, remarks, category_id) {
    const payload = new FormData();
    payload.append("email", email);
    payload.append("remarks", remarks);
    payload.append("category_id", category_id);
    file.forEach((ele, i) => {
      payload.append("files", ele);
    });
    const config = {
      headers: { "content-type": "multipart/form-data" },
    };
    return api.post(`/documentService/uploadFile`, payload, config).then((response) => {
      return response;
    })
    .catch((err) => {
      throw err;
    });;
  }

  getAllDocuments(user_info) {
    const querybuilder = `?email=${user_info.email}`;
    return api
      .get(`/documentService/uploadedFilesList/${querybuilder}`)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        console.log(err)
        return this.getAllDocuments()
      });
  }

  deleteDocument(chunk_ids,file_name) {
    const data = {
      chunk_ids:chunk_ids,
      blob_name: file_name
    };
    return api
      .post("/documentService/deleteFile",data)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

export default new documentService();
