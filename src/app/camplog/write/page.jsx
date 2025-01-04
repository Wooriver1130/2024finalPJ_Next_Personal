"use client"
import { Box, Button, FormControl, Grid2, Input, InputLabel, MenuItem, Modal, Paper, Select, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, TextField } from '@mui/material';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import ClearIcon from '@mui/icons-material/Clear';
import React, { use, useEffect, useRef, useState } from 'react';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { ChevronLeft, ChevronRight, Search } from '@mui/icons-material';
import axios from 'axios';
import { CSSTransition } from 'react-transition-group';
import './page.css';

import CheckIcon from '@mui/icons-material/Check';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useRouter } from 'next/navigation';

function Page(props) {
    const baseUrl = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;
    const imgUrl = process.env.NEXT_PUBLIC_LOCAL_IMG_URL;
    const [extraFields, setExtraFields] = useState([]);
    const fileRef = useRef({});
    const [tags, setTags] = useState([]);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showCampModal, setShowCampModal] = useState(false);
    const [LinkedCampIdx, setLinkedCampIdx] = useState("0");
    const [campData, setCampData] = useState([]);
    const limit = 6;
    let [nowPage, setNowPage] = useState(1);
    let [totalPage, setTotalPage] = useState(0);
    const offset = (nowPage - 1) * limit;
    const [selectedDoNm2, setSelectedDoNm2] = useState("전체");
    const [logTitle, setLogTitle] = useState("");
    const [logDefaultContent, setLogDefaultContent] = useState("");
    const [linkedItem, setLinkedItem] = useState([]);
    const [linkList, setLinkList] = useState([]);
    const [errMsg, setErrMsg] = useState("");
    const [dealKeyWord, setDealKeyWord] = useState("");
    const filteredDealList = linkList.filter(list => list.dealTitle.toLowerCase().includes(dealKeyWord.toLowerCase()));
    const [campKeyWord, setCampKeyWord] = useState("");
    const [filteredCampList, setFilteredCampList] = useState([]);
    const isExfieldFilled = () => extraFields.some(field => field.text.length > 0 || field.file != null);
    const [selectedCampIdx, setSelectedCampIdx] = useState(0);
    const [selectedDealIdx, setSelectedDealIdx] = useState(0);
    const [confirmedCampIdx, setConfirmedCampIdx] = useState(0);
    const [confirmedDealIdx, setConfirmedDealIdx] = useState(0);
    const [showCountForDealList, setShowCountForDealList] = useState(5);
    const router = useRouter();
    const iscanWrite = () => {

        if (logTitle.length === 0) { // 제목 여부
            return "noTitle"
        }
        // 제목은 있음
        if (logDefaultContent.length > 0) { // 기본 텍스트필드 여부
            if (extraFields.length > 0) { // 추가필드 여부
                if (isExfieldFilled()) { // 추가필드 비어있는지 여부
                    if (tags.some(tag => tag.text.length === 0)) {
                        return "emptyTag"
                    } else {
                        return "ok";
                    }
                }
                return "exEmpty";
            } else {
                return "ok"
            }
        } else if (logDefaultContent.length == 0) {
            if (extraFields.length > 0) {
                if (isExfieldFilled()) { // 추가필드 비어있는지 여부
                    return "ok"
                }
                return "exEmpty";
            } else {
                return "noContent"
            }
        }
        if (tags.some(tag => tag.text.length === 0)) {
            return "emptyTag"
        } else {
            return "ok"
        }
    }
    const createNewField = () => {
        if (extraFields.length < 10) {
            setExtraFields([...extraFields, {
                id: Date.now(),
                file: null,
                text: "",
                previewImg: null,
                showOverlay: false,
                isThumbnail: false
            }]);
        } else {
            alert("사진은 최대 10장까지만 넣을 수 있습니다.");
        }
    }
    const handleFileBtn = (id) => {
        fileRef.current[id].click();
    }
    const handleDelField = (delId) => {
        if (confirm(" 작성했던 글과 사진이 사라집니다. 정말 삭제하시겠습니까?")) {
            setExtraFields(extraFields.filter((item) => item.id != delId));
        }
    }
    const handleFileChange = (id, e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                alert("이미지 파일만 업로드할 수 있습니다.");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert("파일 크기는 5MB까지 업로드할 수 있습니다.");
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                setExtraFields(extraFields => extraFields.map((field) => {
                    return (
                        field.id === id ?
                            {
                                ...field,
                                previewImg: e.target.result,
                                file: file,
                                isThumbnail: extraFields.some(field => field.previewImg != null) ? false : true
                            }
                            : field
                    );

                }))
                setTags(tags => tags.filter(tag => tag.fieldID !== id));
            }
        }
    }
    const handleImgOverlay = (id) => {
        setExtraFields(extraFields => extraFields.map(field => {
            return (
                field.id === id ?
                    {
                        ...field,
                        showOverlay: !field.showOverlay
                    }
                    : field
            );
        }))
    }
    const handleAddTag = (e, fieldID) => {

        if (tags.filter(tag => tag.fieldID === fieldID).length >= 10) {
            alert("상품태그는 사진당 10개까지만 추가할 수 있습니다.");
            return;
        } else {
            const img = e.target.getBoundingClientRect();
            const x = e.clientX - img.left;
            const y = e.clientY - img.top;

            const filedIdx = extraFields.findIndex(field => field.id === fieldID) + 1;

            setTags(tags => [
                ...tags,
                { tagX: x, tagY: y, tagId: Date.now(), fieldID: fieldID, showContent: false, text: "", showModal: true, fieldIdx: filedIdx, dealIdx: 0, nodeRef: React.createRef() }
            ]);
            handleImgOverlay(fieldID);
        }

    }
    const handleTagContent =  (tagId) => {
        setTags(tags.map(tag => {
            if (tag.tagId === tagId) {
                if (tag.showContent) {
                    return { ...tag, showContent: false };
                } else {
                    return { ...tag, showContent: true }
                }
            }
            return { ...tag, showContent: false };
        }));
    };
    const handleTagDelete = (delId) => {
        if (confirm("태그를 삭제하시겠습니까?")) {
            setTags(tags.filter(tag => tag.tagId !== delId));

        }
    }
    const handleTagText = (e, tagId) => {
        setTags(tags.map(tag => {
            return (
                tag.tagId === tagId ?
                    ({ ...tag, text: e.target.value })
                    :
                    (tag)
            );
        }));
    }
    const handleTagModal = (tagId) => {
        setTags(tags.map(tag => {
            return (
                tag.tagId === tagId ?
                    ({ ...tag, showModal: !tag.showModal })
                    :
                    (tag)
            );
        }));
    };

    const handleOpenLinkModal = async () => {
        const apiUrl = `${baseUrl}/camplog/linkmodal/${1}`; // userIdx대신 임시값
        try {
            const response = await axios.get(apiUrl);
            console.log("response: ", response);
            if (response.data.success) {
                const data = response.data.data;
                setLinkList(data.map(data => {
                    return (
                        {
                            ...data,
                            isLinked: false,
                            tagId: ""
                        }
                    )
                }));
                setShowLinkModal(true);
            } else {
                if (response.data.message === "데이터를 불러오는 중에 문제가 발생했습니다.") {
                    alert(response.data.message);
                }
            }
        } catch (error) {
            console.error("error: " + error);
            alert("서버 오류 발생");
        }
    }
    const handleChangeThumbnail = (fieldID) => {
        setExtraFields(extraFields.map(field => {
            return (
                field.id === fieldID ?
                    {
                        ...field,
                        isThumbnail: true
                    }
                    :
                    {
                        ...field,
                        isThumbnail: false
                    }
            );
        }));
    }
    const handleExtraContent = (e, fieldId) => {
        setExtraFields(extraFields.map(field => {
            return (
                field.id === fieldId ?
                    ({ ...field, text: e.target.value })
                    :
                    (field)
            );
        })
        );
    }
    const contentData = [
        {
            logContent: logDefaultContent,
            logContentOrder: 0
        },

        ...extraFields.map((field, index) => ({
            logContent: field.text,
            logContentOrder: index + 1
        }))
    ].filter(item => item.logContent != "");

    const mpFiles = extraFields.filter(item => item.file != null).map(field => field = field.file);

    const fileData = [
        ...extraFields.map((field, index) => {
            return {
                fileOrder: index + 1,
                isThumbnail: field.isThumbnail ? 1 : 0,
                isFileThere: field.file ? true : false
            }
        }).filter(data => data.isFileThere == true)
    ];
    const tagData = [
        ...tags.map(tag => {
            return {
                logIdx: 1,
                fieldIdx: tag.fieldIdx,
                tagX: tag.tagX,
                tagY: tag.tagY,
                tagId: tag.tagId,
                dealIdx: tag.dealIdx,
                tagContent: tag.text
            }
        })
    ]

    const handleWrite = async () => {
        if (iscanWrite() === "ok") {
            const apiUrl = `${baseUrl}/camplog/write`;
            const writeData = {
                uvo: { userIdx: "1" },
                cvo: { campIdx: confirmedCampIdx },
                lvo: { logTitle: logTitle, logIdx: "1" },
                lcvo: { contentData: contentData },
                fvo: fileData.length > 0 ? { fileData: fileData } : null,
                tvo: tagData.length > 0 ? { tagData: tagData } : null,
            }
            const formData = new FormData();
            formData.append("WriteData", new Blob([JSON.stringify(writeData)], { type: "application/json" }));
            if (mpFiles.length > 0) {
                mpFiles.forEach((file) => {
                    formData.append("mpFiles", file);
                });
            }

            try {
                const response = await axios.post(apiUrl, formData);
                console.log("response: ", response);
                if (response.data.success) {
                    alert(response.data.message);
                } else {
                    alert(response.data.message);
                }
                router.push("/camplog/list");
            } catch (error) {
                console.error("Error:", error);
                alert(response.data.message);
            }
        } else if (iscanWrite() === "noTitle") {
            alert("제목을 입력해주세요");
        } else if (iscanWrite() === "noContent") {
            alert("내용을 입력해주세요.");
        } else if (iscanWrite() === "exEmpty") {
            alert("추가 필드에 내용이나 사진을 넣어주세요");
        } else if (iscanWrite() === "emptyTag") {
            alert("내용이 비어있는 태그가 존재합니다.");
        }
    }

    const handleSelectedDealIdx = (dealIdx) => {
        if (selectedDealIdx === dealIdx) {
            setSelectedDealIdx(0)
        } else {
            setSelectedDealIdx(dealIdx)
        }
    }
    const handleSelectCamp = (campIdx) => {
        if (selectedCampIdx === campIdx) {
            setSelectedCampIdx(0);
        } else {
            setSelectedCampIdx(campIdx);
        }
    }
    useEffect(() => {
        setShowCountForDealList(5);
    }, [dealKeyWord]);

    const handleGetLinked = () => {
        setConfirmedDealIdx(selectedDealIdx);
        selectedDealIdx != 0 && alert("상품연동이 완료되었습니다.");
        setShowLinkModal(false);
    }
    useEffect(() => {
        setTags(tags.map(tag => {
            return (
                tag.showContent ?
                    ({
                        ...tag,
                        dealIdx: confirmedDealIdx
                    })
                    : ({ ...tag })
            );
        }))
    }, [confirmedDealIdx]);
    const handleCurrencyToWon = (price) => {
        return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(price);
    }
    const handleCampModal = async () => {
        const apiUrl = `${baseUrl}/camplog/campmodal?userIdx=${1}&campIdx=${LinkedCampIdx}`;// userIdx 임시값
        try {
            console.log("여기도착1");
            const response = await axios.get(apiUrl);
            console.log("response: ", response);
            if (response.data.success) {
                const data = response.data.data
                setCampData(data);
                setFilteredCampList(data.filter(list =>
                    list.facltNm.toLowerCase().includes(campKeyWord.toLowerCase())
                ));
                setShowCampModal(true);
            } else {
                if (response.data.message === "데이터를 불러오는 중에 문제가 발생했습니다.") {
                    alert(response.data.message);
                } else {
                    alert(response.data.message);
                }
            }
        } catch (error) {
            console.error("error: " + error);
            alert("서버 오류 발생");
        }
    }
    useEffect(() => {
        if (filteredCampList.length > 0) {
            if (filteredCampList.length % limit === 0) {
                setTotalPage(filteredCampList.length / limit);
            } else {
                setTotalPage(Math.floor(filteredCampList.length / limit) + 1);
            }
        } else {
            setNowPage(1);
            setTotalPage(1);
        }
    }, [filteredCampList]);

    useEffect(() => {
        setFilteredCampList(campData.filter(list => list.facltNm.toLowerCase().includes(campKeyWord.toLowerCase()) && (selectedDoNm2 === "전체" ? true : list.doNm2 === selectedDoNm2)));
        setNowPage(1);
    }, [campKeyWord, selectedDoNm2, campData]);

    const handleCampLinked = () => {
        setCampData(campData.map(list => {
            return (
                list.campIdx === confirmedCampIdx ?
                    ({ ...list, isLinked: true })
                    :
                    ({ ...list, isLinked: false })
            );
        }));
        setConfirmedCampIdx(selectedCampIdx);
        setShowCampModal(false);
    }

    return (
        <>
            <header >
                <span style={{ fontSize: "70px", display: "inline-block" }}> </span><span style={{ display: "inline-block", fontSize: "50px", marginLeft: "33%" }}>캠핑로그 작성</span>
            </header>
            <Grid2 container spacing={2}>
                <Grid2 size={1} />
                <Grid2 size={1}>
                    {extraFields.some(field => field.previewImg != null) ? (
                        <div style={{ border: "1px solid gray", width: "120px", maxHeight: "50vh", position: "fixed", textAlign: 'center', overflowY: "auto" }}>
                            <style>
                                {/* 이미지바 스크롤 CSS */}
                                {`
                                    div::-webkit-scrollbar {
                                        width: 6px; 
                                    }
                                    div::-webkit-scrollbar-thumb {
                                        background: #888; /* 스크롤바 색상 */
                                        border-radius: 3px; 
                                    }
                                    div::-webkit-scrollbar-thumb:hover {
                                        background: #555; 
                                    }
                                    div::-webkit-scrollbar-track {
                                        background: #f1f1f1;  
                                    }
                                    `}
                            </style>
                            {extraFields.filter(field => field.previewImg != null).map(field => {
                                return (
                                    <div key={field.id}>
                                        {field.isThumbnail ? (<span style={{ color: "red" }}>대표사진</span>) : ""}
                                        <img
                                            key={field.id}
                                            alt=''
                                            src={field.previewImg}
                                            style={{
                                                width: "100px",
                                                height: "100px",
                                                cursor: "pointer",
                                                marginTop:"7px",
                                                objectFit: 'cover',
                                                border: field.isThumbnail ? "4px solid red" : "none",
                                            }}
                                            onClick={() => handleChangeThumbnail(field.id)}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    ) : null}
                </Grid2>
                <Grid2 size={6} textAlign={'center'} >
                    <Button variant="outlined" style={{ float: "left", marginRight: "10px" }} onClick={() => handleCampModal()}>+ 장소 추가</Button>
                    <span style={{ fontWeight: "bold", fontSize: "20px", float: "left" }}>{campData.filter(camp => camp.campIdx === confirmedCampIdx).map(camp => camp.facltNm)}</span>
                    <Button variant="contained" style={{ float: "right" }} onClick={handleWrite}>작성</Button>
                    <br />
                    <TextField id="outlined-basic" label="제목을 입력해주세요." value={logTitle} variant="outlined" onChange={(e) => setLogTitle(e.target.value)} style={{ marginTop: "30px" }} fullWidth  inputProps={{ maxLength: 50 }} />
                    <TextField id="outlined-basic" label="내용을 입력해주세요." value={logDefaultContent} variant="outlined" onChange={(e) => setLogDefaultContent(e.target.value)} fullWidth multiline minRows={5} maxRows={20} style={{ marginTop: "20px" }} inputProps={{ maxLength: 1000 }} />
                    <br />

                    {extraFields.map((field) => {
                        return (
                            <div key={field.id} style={{ border: "1px solid black", marginTop: "30px", padding: "20px" }} >
                                <ClearIcon onClick={() => { handleDelField(field.id) }} fontSize='large' style={{ float: "right" }} />
                                {field.previewImg ?
                                    (
                                        <div style={{ textAlign: 'center', zIndex: "0" }}>
                                            {field.showOverlay ?
                                                (
                                                    <div style={{ position: 'relative', maxWidth: "100%", marginTop: "20px", display: "inline-block", marginBottom: "20px" }}>
                                                        <img src={field.previewImg} alt='' onClick={(e) => handleAddTag(e, field.id)} style={{ filter: "brightness(0.5)", transition: "1s", maxWidth: "100%" }} />
                                                        <p style={{ position: "absolute", color: "white", fontWeight: "bold", left: "50%", top: "50%", fontSize: "20px", transform: "translate(-50%, -50%)", pointerEvents: "none" }}>태그를 추가하고 싶은 곳을 선택하세요</p>
                                                        {tags.filter(tag => tag.fieldID === field.id).map(tag => {
                                                            return (
                                                                <div key={tag.tagId}>
                                                                    <AddCircleIcon
                                                                        style={{
                                                                            top: `${tag.tagY}px`,
                                                                            left: `${tag.tagX}px`,
                                                                            position: "absolute",
                                                                            transform: "translate(-50%, -50%)",
                                                                            zIndex: "1"
                                                                        }}
                                                                        color='primary'
                                                                        fontSize='large'
                                                                    />
                                                                    <div
                                                                        style={{
                                                                            top: `${tag.tagY}px`,
                                                                            left: `${tag.tagX}px`,
                                                                            position: "absolute",
                                                                            transform: "translate(-50%, -50%)",
                                                                            width: "14px",
                                                                            height: '14px',
                                                                            backgroundColor: 'white',
                                                                        }}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )
                                                :
                                                (
                                                    <div style={{ position: 'relative', maxWidth: "100%", marginTop: "20px", marginBottom: "20px", display: "inline-block", overflow: "visible" }} >
                                                        <img src={field.previewImg} alt='' style={{ maxWidth: "100%" }} />
                                                        {tags.filter(tag => tag.fieldID === field.id).map(tag => {
                                                            return (
                                                                <div key={tag.tagId}>
                                                                    <div onClick={() => handleTagContent(tag.tagId)}>
                                                                        <AddCircleIcon
                                                                            style={{
                                                                                top: `${tag.tagY}px`,
                                                                                left: `${tag.tagX}px`,
                                                                                position: "absolute",
                                                                                transform: "translate(-50%, -50%)",
                                                                                zIndex: "1"
                                                                            }}
                                                                            color='primary'
                                                                            fontSize='large'
                                                                        />
                                                                        <div
                                                                            style={{
                                                                                top: `${tag.tagY}px`,
                                                                                left: `${tag.tagX}px`,
                                                                                position: "absolute",
                                                                                transform: "translate(-50%, -50%)",
                                                                                width: "14px",
                                                                                height: '14px',
                                                                                backgroundColor: 'white',

                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <CSSTransition in={tag.showContent} timeout={500} classNames="fade" nodeRef={tag.nodeRef} unmountOnExit>
                                                                        <div ref={tag.nodeRef}>
                                                                            <div
                                                                                style={{
                                                                                    top: `${tag.tagY - 57}px`,
                                                                                    left: `${tag.tagX + 40}px`,
                                                                                    position: "absolute",
                                                                                    transform: "translate(-50%, -50%)",
                                                                                    width: "300px",
                                                                                    height: "50px",
                                                                                    backgroundColor: "white",
                                                                                    zIndex: "1",
                                                                                    display: "flex",
                                                                                    justifyContent: "flex-start",
                                                                                    alignItems: "center",

                                                                                }}
                                                                            >
                                                                                <Input
                                                                                    placeholder="제품소개 입력"
                                                                                    inputProps={{ value: tag.text, maxLength: 20 }}
                                                                                    onChange={(e) => handleTagText(e, tag.tagId)}
                                                                                    style={{ width: "70%", marginLeft: "10px" }}
                                                                                />
                                                                                <p
                                                                                    style={{
                                                                                        fontSize: "14px",
                                                                                        textDecoration: "underline",
                                                                                        color: "gray",
                                                                                        cursor: "pointer",
                                                                                        marginTop: "15px",
                                                                                        marginLeft: "10px",
                                                                                        marginRight: "15px"
                                                                                    }}

                                                                                    onClick={() => handleTagDelete(tag.tagId)}
                                                                                >삭제</p>
                                                                                <p
                                                                                    style={{
                                                                                        zIndex: "1",
                                                                                        fontSize: "70px",
                                                                                        cursor: "pointer"
                                                                                    }}
                                                                                    onClick={() => handleTagModal(tag.tagId)}
                                                                                >&rsaquo;</p>
                                                                            </div>
                                                                            <svg
                                                                                style={{
                                                                                    top: `${tag.tagY - 26}px`,
                                                                                    left: `${tag.tagX}px`,
                                                                                    position: "absolute",
                                                                                    transform: "translate(-50%, -50%)",
                                                                                    zIndex: "1",
                                                                                    overflow: "visible"
                                                                                }}
                                                                                width="30"
                                                                                height="30"
                                                                                viewBox=" 0 0 100 100"
                                                                            >
                                                                                <polygon points="50,90 90,30 10,30" fill="white" />
                                                                            </svg>
                                                                            {tag.showModal ? (
                                                                                <Paper
                                                                                    style={{
                                                                                        top: `${tag.tagY + 7}px`,
                                                                                        left: `${tag.tagX + 340}px`,
                                                                                        position: "absolute",
                                                                                        transform: "translate(-50%, -50%)",
                                                                                        zIndex: "1",
                                                                                        width: "300px",
                                                                                        height: "180px",
                                                                                        backgroundColor: "white"
                                                                                    }}
                                                                                    elevation={3}
                                                                                >
                                                                                    <span style={{ display: "inline-block", float: "left", fontWeight: "bold", fontSize: "18px", margin: "5px" }}>링크된 상품</span>
                                                                                    <span
                                                                                        style={{
                                                                                            fontSize: "16px",
                                                                                            fontWeight: 'bold',
                                                                                            color: "#1976d2",
                                                                                            display: "inline-block",
                                                                                            float: "right",
                                                                                            cursor: "pointer",
                                                                                            margin: "5px"
                                                                                        }}
                                                                                        onClick={() => handleOpenLinkModal(tag.tagId)}
                                                                                    >
                                                                                        거래상품 연동하기
                                                                                    </span>
                                                                                    <br />
                                                                                    <br />
                                                                                    {tag.dealIdx > 0 ?
                                                                                        (
                                                                                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                                                                                <img src={`${imgUrl}/${linkList.filter(list => list.dealIdx === tag.dealIdx).map(list => list.fileName)}`}
                                                                                                    alt=''
                                                                                                    style={{ width: '45%', height: '110px', display: "inline-block", margin: "10px 0 10px 10px" }}>
                                                                                                </img>
                                                                                                <div style={{ width: '55%', height: '110px', display: "block", margin: "10px" }}>
                                                                                                    <p style={{ wordWrap: "break-word", wordBreak: "break-all", fontWeight: 'bold', fontSize: "20px", marginBottom: "20px" }}>
                                                                                                        {linkList.filter(list => list.dealIdx === tag.dealIdx).map(list => list.dealTitle)}
                                                                                                    </p>
                                                                                                    <p style={{ wordWrap: "break-word", wordBreak: "break-all", fontWeight: 'bold', fontSize: "17px" }}>
                                                                                                        {handleCurrencyToWon(linkList.filter(list => list.dealIdx === tag.dealIdx).map(list => list.dealPrice))}원
                                                                                                    </p>
                                                                                                </div>
                                                                                            </div>
                                                                                        )
                                                                                        :
                                                                                        (
                                                                                            <>
                                                                                                <br />
                                                                                                <br />
                                                                                                <p>현재 연동된 상품이 없습니다.</p>
                                                                                            </>
                                                                                        )
                                                                                    }
                                                                                </Paper>
                                                                            ) : null}
                                                                        </div>
                                                                    </CSSTransition>

                                                                </div>

                                                            );
                                                        })}

                                                    </div>

                                                )}


                                            <br />
                                            <Button variant="contained" onClick={() => handleImgOverlay(field.id)}>태그 추가하기</Button>
                                            <span style={{ display: 'inline-block', marginLeft: "20%", cursor: "pointer" }} onClick={() => handleFileBtn(field.id)}>사진 변경하기<AutorenewIcon fontSize='large' /></span>

                                        </div>
                                    )
                                    :
                                    (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{
                                                display: "inline-block",
                                                width: '400px',
                                                height: "300px",
                                                marginTop: '20px',
                                                backgroundColor: "#F0F0F0",
                                                textAlign: "center",
                                            }}>
                                                <br />
                                                <AddAPhotoIcon fontSize='large' style={{ marginTop: "50px" }} />
                                                <br />
                                                <br />
                                                <p>버튼을 클릭해 사진을 첨부해 보세요.</p>
                                                <Button variant="contained" onClick={() => handleFileBtn(field.id)}>첨부하기</Button>
                                            </div>
                                        </div>
                                    )}

                                <input
                                    id={field.id}
                                    type="file"
                                    ref={el => (fileRef.current[field.id] = el)}
                                    style={{ display: "none" }}
                                    accept=".jpg, .jpeg, .png"
                                    onChange={e => handleFileChange(field.id, e)}
                                />
                                <div>
                                    <TextField id="outlined-basic" label="내용을 입력해주세요." variant="outlined" fullWidth multiline minRows={5} maxRows={20} style={{ marginTop: "20px" }} inputProps={{ maxLength: 1000 }} onChange={(e) => handleExtraContent(e, field.id)} />
                                </div>
                            </div>
                        )
                    })}
                    {extraFields.length > 0 && extraFields.some(field => field.file == null) ?
                        (null) : (<Button variant="contained" style={{ fontSize: "35px", width: "400px", marginTop: "20px" }} onClick={createNewField}>+</Button>)}
                </Grid2>
                <Grid2 size={4} />

            </Grid2>
            <Modal
                open={showLinkModal}
                onClose={() => setShowLinkModal(false)}
            >
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "700px", backgroundColor: "white" }}>
                    <div style={{ marginTop: "20px", marginLeft: "20px", border: "1px solid gray", width: "80%", display: 'inline-block', height: "5%" }}>
                        <Search />
                        <Input placeholder='상품명을 입력해주세요' style={{ width: "90%" }} onChange={(e) => setDealKeyWord(e.target.value)} disableUnderline />
                    </div>
                    <ClearIcon fontSize='large' style={{ float: "right", cursor: "pointer" }} onClick={() => setShowLinkModal(false)} />
                    <hr style={{ marginBottom: "0" }} />
                    <TableContainer sx={{ height: "85%" }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>상품사진</TableCell>
                                    <TableCell>상품명</TableCell>
                                    <TableCell>가격</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredDealList.length > 0 ?
                                    (
                                        filteredDealList.slice(0, showCountForDealList).map(list => {
                                            return (
                                                <TableRow key={list.dealIdx} onClick={() => handleSelectedDealIdx(list.dealIdx)} style={{ backgroundColor: list.dealIdx === selectedDealIdx ? "#A9A9A9" : "white" }} >
                                                    <TableCell >
                                                        <div style={{ width: "fit-content", position: "relative" }}>
                                                            <img src={`${imgUrl}/${list.fileName}`} alt='' style={{ width: '100px', height: '100px', filter: list.dealIdx === selectedDealIdx ? "brightness(0.5)" : "brightness(1)" }} ></img>
                                                            {list.dealIdx === selectedDealIdx && <CheckIcon style={{ position: "absolute", transform: "translate(-50%, -50%)", top: "50%", left: "50%", fontSize: "80px", color: "white" }} />}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p>{list.dealTitle}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p>{list.dealPrice}</p>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )
                                    :
                                    (
                                        <TableRow>
                                            <TableCell colSpan={3} align='center'>
                                                등록된 상품이 없습니다.
                                            </TableCell>
                                        </TableRow>
                                    )}
                            </TableBody>
                            {showCountForDealList < filteredDealList.length &&
                                <TableFooter>
                                    <TableRow onClick={() => setShowCountForDealList(showCountForDealList + 5)}>
                                        <TableCell colSpan={3} style={{ textAlign: "center", borderTop: "1px solid black", height: "50px" }} ><ArrowDropDownIcon style={{ fontSize: "50px" }} /></TableCell>
                                    </TableRow>
                                </TableFooter>
                            }
                        </Table>
                    </TableContainer>
                    <div style={{ width: "100%", height: "10%", backgroundColor: "white", display: "flex", justifyContent: "center", borderTop: "1px solid black" }}>
                        <Button style={{ margin: "20px", height: "30px" }} variant="outlined" onClick={() => setShowLinkModal(false)}>취소</Button>
                        <Button style={{ margin: "20px", height: "30px" }} variant="contained" onClick={handleGetLinked}>확인</Button>
                    </div>
                </div>
            </Modal>

            <Modal
                open={showCampModal}
                onClose={() => setShowCampModal(false)}
            >
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "700px", backgroundColor: "white" }}>
                    <div style={{ margin: "20px 0 10px 40px", border: "1px solid lightgray", width: "80%", display: 'inline-block', height: "5%" }}>
                        <Search />
                        <Input placeholder=' 캠핑장명을 입력해주세요' style={{ width: "90%" }} onChange={(e) => setCampKeyWord(e.target.value)} disableUnderline />
                    </div>
                    <ClearIcon fontSize='large' style={{ float: "right", cursor: "pointer" }} onClick={() => setShowCampModal(false)} />
                    <div style={{ display: "flex", justifyContent: "start", height: "9%", margin: "0 10px 10px 30px" }}>
                        <div style={{ backgroundColor: "#1976D2", width: "15%", color: "white", fontWeight: "bold", margin: "10px", padding: "10px" }}>
                            {filteredCampList.length} 개
                        </div>
                        <div style={{
                            border: "1px solid lightgray",
                            width: "fit-content",
                            color: "white",
                            margin: "10px",
                            textAlign: "center",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <ChevronLeft
                                color={"action"}
                                style={{ margin: "0 10px", cursor: nowPage === 1 ? "" : "pointer" }}
                                onClick={() => setNowPage(nowPage === 1 ? 1 : nowPage - 1)}
                            />
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <span style={{ fontSize: "18px", color: "black" }}>{nowPage}</span>
                                <span style={{ fontSize: "18px", color: "black", margin: "0 5px" }}>/</span>
                                <span style={{ fontSize: "18px", color: "black" }}>{totalPage}</span>
                            </div>
                            <ChevronRight color="action" style={{ margin: "0 10px", cursor: nowPage === totalPage ? "" : "pointer" }} onClick={() => setNowPage(nowPage === totalPage ? totalPage : nowPage + 1)} />
                        </div>
                        <div style={{ width: "23%", margin: "10px" }}>
                            <FormControl fullWidth size='small' >
                                <InputLabel id="demo-simple-select-label">행정구역</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="행정구역"
                                    value={selectedDoNm2}
                                    onChange={(e) => setSelectedDoNm2(e.target.value)}
                                >
                                    <MenuItem value="전체">전체</MenuItem>
                                    <MenuItem value="서울특별시">서울특별시</MenuItem>
                                    <MenuItem value="부산광역시">부산광역시</MenuItem>
                                    <MenuItem value="대구광역시">대구광역시</MenuItem>
                                    <MenuItem value="인천광역시">인천광역시</MenuItem>
                                    <MenuItem value="광주광역시">광주광역시</MenuItem>
                                    <MenuItem value="대전광역시">대전광역시</MenuItem>
                                    <MenuItem value="울산광역시">울산광역시</MenuItem>
                                    <MenuItem value="경기도">경기도</MenuItem>
                                    <MenuItem value="강원도">강원도</MenuItem>
                                    <MenuItem value="충청북도">충청북도</MenuItem>
                                    <MenuItem value="충청남도">충청남도</MenuItem>
                                    <MenuItem value="전라북도">전라북도</MenuItem>
                                    <MenuItem value="전라남도">전라남도</MenuItem>
                                    <MenuItem value="경상북도">경상북도</MenuItem>
                                    <MenuItem value="경상남도">경상남도</MenuItem>
                                    <MenuItem value="제주도">제주도</MenuItem>
                                    <MenuItem value="세종시">세종시</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                    {filteredCampList.length > 0 ?
                        (
                            <Grid2 container spacing={0} height="80%" justifyContent="center">
                                {Array.from(filteredCampList).sort((a, b) => a.campIdx === confirmedCampIdx ? -1 : b.campIdx === confirmedCampIdx ? 1 : 0)
                                    .slice(offset, offset + 6).map((camp, index) => {
                                        return (
                                            <div key={index}>
                                                <Grid2 textAlign="center" padding="0 20px 0 20px" onClick={() => handleSelectCamp(camp.campIdx)} style={{ backgroundColor: camp.campIdx === selectedCampIdx ? "#A9A9A9" : "white" }} >
                                                    {
                                                        camp.firstImageUrl ?
                                                            (
                                                                <div style={{ width: "fit-content", position: "relative" }}>
                                                                    <img
                                                                        src={camp.firstImageUrl}
                                                                        alt=''
                                                                        style={{ width: '210px', height: '112.5px', borderRadius: "8px", display: "inline-block", marginBottom: "5px", filter: camp.campIdx === selectedCampIdx ? "brightness(0.5)" : "brightness(1)" }}>
                                                                    </img>
                                                                    {camp.campIdx === selectedCampIdx && <CheckIcon style={{ position: "absolute", transform: "translate(-50%, -50%)", top: "50%", left: "50%", fontSize: "80px", color: "white" }} />}
                                                                </div>)
                                                            :
                                                            (camp.campImg2 ?
                                                                (<div style={{ width: "fit-content", position: "relative" }}>
                                                                    <img
                                                                        src={camp.campImg2}
                                                                        alt=''
                                                                        style={{ width: '210px', height: '112.5px', borderRadius: "8px", display: "inline-block", marginBottom: "5px", filter: camp.campIdx === selectedCampIdx ? "brightness(0.5)" : "brightness(1)" }}>
                                                                    </img>
                                                                    {camp.campIdx === selectedCampIdx && <CheckIcon style={{ position: "absolute", transform: "translate(-50%, -50%)", top: "50%", left: "50%", fontSize: "80px", color: "white" }} />}
                                                                </div>)
                                                                :
                                                                (camp.campImg3 ?
                                                                    (<div style={{ width: "fit-content", position: "relative" }}>
                                                                        <img
                                                                            src={camp.campImg3}
                                                                            alt=''
                                                                            style={{ width: '210px', height: '112.5px', borderRadius: "8px", display: "inline-block", marginBottom: "5px", filter: camp.campIdx === selectedCampIdx ? "brightness(0.5)" : "brightness(1)" }}>
                                                                        </img>
                                                                        {camp.campIdx === selectedCampIdx && <CheckIcon style={{ position: "absolute", transform: "translate(-50%, -50%)", top: "50%", left: "50%", fontSize: "80px", color: "white" }} />}
                                                                    </div>)
                                                                    :
                                                                    (
                                                                        <div style={{ width: "fit-content", position: "relative" }}>
                                                                            <div style={{ width: '210px', height: '112.5px', display: "inline-block", borderRadius: "8px", backgroundColor: camp.campIdx === selectedCampIdx ? "#A9A9A9" : "lightgray" }}></div>
                                                                            {camp.campIdx === selectedCampIdx && <CheckIcon style={{ position: "absolute", transform: "translate(-50%, -50%)", top: "50%", left: "50%", fontSize: "80px", color: "white" }} />}
                                                                        </div>
                                                                    )))}

                                                    <div style={{ textAlign: "left" }}>
                                                        <p style={{ fontWeight: 'bold', fontSize: "15px", marginBottom: "0" }}>{camp.facltNm.length > 14 ? camp.facltNm.substring(0, 15) : camp.facltNm}</p>
                                                        <span style={{ fontSize: "12px", color: "#1976D2", }}>{camp.doNm2}</span>
                                                        <ChevronRight color="action" fontSize='small' style={{ color: "#1976D2" }} />
                                                        <span style={{ fontSize: "12px", color: "#1976D2" }}>{camp.sigunguNm}</span>
                                                    </div>
                                                </Grid2>
                                            </div>
                                        );
                                    })}
                                {/* 홀수 개 항목일 때 빈 그리드 추가 */}
                                {filteredCampList.slice(offset, offset + 6).length % 2 === 1 && (
                                    <Grid2 xs={6} padding="0 20px 0 20px" >
                                        <div style={{ width: '210px', height: '112.5px', backgroundColor: "white", display: "inline-block", borderRadius: "8px" }}></div>
                                    </Grid2>
                                )}
                            </Grid2>
                        )
                        :
                        (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: "79%"
                            }}>
                                등록된 캠핑장이 없습니다.
                            </div>
                        )}


                    <div style={{ width: "100%", height: "10%", backgroundColor: "white", display: "flex", justifyContent: "center", borderTop: "1px solid black" }}>
                        <Button style={{ margin: "20px", height: "30px" }} variant="outlined" onClick={() => setShowCampModal(false)}>취소</Button>
                        <Button style={{ margin: "20px", height: "30px" }} variant="contained" onClick={handleCampLinked}>확인</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default Page;