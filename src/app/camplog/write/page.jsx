"use client"
import { Box, Button, Grid2, Input, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import ClearIcon from '@mui/icons-material/Clear';
import React, { useRef, useState } from 'react';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Search } from '@mui/icons-material';
import { Tab } from 'bootstrap/dist/js/bootstrap.bundle.min';

function Page(props) {
    const [extraFields, setExtraFields] = useState([]);
    const fileRef = useRef({});
    const [tags, setTags] = useState([]);
    const [showLinkModal, setShowLinkModal] = useState(false);

    const createNewField = () => {
        if (extraFields.length < 10) {
            setExtraFields([...extraFields, {
                id: Date.now(),
                file: null,
                text: "",
                previewImg: null,
                showOverlay: false,
            }]);
        } else {
            alert("사진은 최대 10장까지만 넣을 수 있습니다.");
        }
    }
    const handleFileBtn = (id) => {
        fileRef.current[id].click();
    }
    const handleDelField = (delId) => {
        if (confirm("작성했던 글과 사진이 사라집니다. 정말 삭제하시겠습니까?")) {
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
                setExtraFields(extraFields => extraFields.map(field => {
                    return (
                        field.id === id ?
                            {
                                ...field,
                                previewImg: e.target.result

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

            setTags(tags => [
                ...tags,
                { x, y, tagId: Date.now(), fieldID: fieldID, showContent: false, text: "", showModal: true }
            ]);
            handleImgOverlay(fieldID);
        }

    }
    const handleTagContent = (tagId) => {
        setTags(tags.map(tag => {
            return (
                tag.tagId === tagId ?
                    ({ ...tag, showContent: !tag.showContent })
                    :
                    ({ ...tag, showContent: false })
            );
        }));
    }
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
    }
    const handleOpenLinkModal = () => {
        setShowLinkModal(true);
    }
    return (
        <>
            <header >
                <span style={{ fontSize: "70px", display: "inline-block" }}> </span><span style={{ display: "inline-block", fontSize: "50px", marginLeft: "33%" }}>캠핑로그 작성</span>
            </header>
            <Grid2 container spacing={1}>
                <Grid2 size={1} />
                <Grid2 size={1}>
                    <div style={{ border: "1px solid black", width: "100px", height: "100px", position: "fixed" }}>
                    </div>
                </Grid2>
                <Grid2 size={6}>
                    <Button variant="outlined">+ 장소 추가</Button>
                    <span style={{ fontWeight: "bold", fontSize: "20px" }}>경상남도 의령군 벽계야영장</span>
                    <Button variant="contained" style={{ float: "right" }}>작성</Button>
                    <br />
                    <TextField id="outlined-basic" label="제목을 입력해주세요." variant="outlined" style={{ marginTop: "30px" }} fullWidth />
                    <TextField id="outlined-basic" label="내용을 입력해주세요." variant="outlined" fullWidth multiline rows={5} style={{ marginTop: "20px" }} />
                    <br />

                    {extraFields.map((field) => {
                        return (
                            <div key={field.id}>
                                <ClearIcon onClick={() => { handleDelField(field.id) }} fontSize='large' style={{ float: "right" }} />
                                {field.previewImg ?
                                    (

                                        <div style={{ textAlign: 'center' }}>
                                            {field.showOverlay ?
                                                (
                                                    <div style={{ position: 'relative', maxWidth: "100%", marginTop: "20px", display: "inline-block" }}>
                                                        <img src={field.previewImg} alt='' onClick={(e) => handleAddTag(e, field.id)} style={{ filter: "brightness(0.5)", transition: "1s", maxWidth: "100%" }} />
                                                        <p style={{ position: "absolute", color: "white", fontWeight: "bold", left: "50%", top: "50%", fontSize: "20px", transform: "translate(-50%, -50%)", pointerEvents: "none" }}>태그를 추가하고 싶은 곳을 선택하세요</p>
                                                        {tags.filter(tag => tag.fieldID === field.id).map(tag => {
                                                            return (
                                                                <div key={tag.tagId}>
                                                                    <AddCircleIcon
                                                                        style={{
                                                                            top: `${tag.y}px`,
                                                                            left: `${tag.x}px`,
                                                                            position: "absolute",
                                                                            transform: "translate(-50%, -50%)",
                                                                            zIndex: "1"
                                                                        }}
                                                                        color='primary'
                                                                        fontSize='large'
                                                                    />
                                                                    <div
                                                                        style={{
                                                                            top: `${tag.y}px`,
                                                                            left: `${tag.x}px`,
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
                                                    <div style={{ position: 'relative', maxWidth: "100%", marginTop: "20px", display: "inline-block" }} >
                                                        <img src={field.previewImg} alt='' style={{ maxWidth: "100%" }} />
                                                        {tags.filter(tag => tag.fieldID === field.id).map(tag => {
                                                            return (
                                                                <div key={tag.tagId}>
                                                                    <div onClick={() => handleTagContent(tag.tagId)}>
                                                                        <AddCircleIcon
                                                                            style={{
                                                                                top: `${tag.y}px`,
                                                                                left: `${tag.x}px`,
                                                                                position: "absolute",
                                                                                transform: "translate(-50%, -50%)",
                                                                                zIndex: "1"
                                                                            }}
                                                                            color='primary'
                                                                            fontSize='large'
                                                                        />
                                                                        <div
                                                                            style={{
                                                                                top: `${tag.y}px`,
                                                                                left: `${tag.x}px`,
                                                                                position: "absolute",
                                                                                transform: "translate(-50%, -50%)",
                                                                                width: "14px",
                                                                                height: '14px',
                                                                                backgroundColor: 'white',
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    {tag.showContent ?
                                                                        <>
                                                                            <Input
                                                                                placeholder="제품소개 입력"
                                                                                inputProps={{ value: tag.text }}
                                                                                style={{
                                                                                    top: `${tag.y - 57}px`,
                                                                                    left: `${tag.x}px`,
                                                                                    position: "absolute",
                                                                                    transform: "translate(-50%, -50%)",
                                                                                    zIndex: "2"
                                                                                }}
                                                                                onChange={(e) => handleTagText(e, tag.tagId)}
                                                                            />
                                                                            <div
                                                                                style={{
                                                                                    top: `${tag.y - 57}px`,
                                                                                    left: `${tag.x + 40}px`,
                                                                                    position: "absolute",
                                                                                    transform: "translate(-50%, -50%)",
                                                                                    width: "300px",
                                                                                    height: "50px",
                                                                                    backgroundColor: "white",
                                                                                    zIndex: "1"
                                                                                }}
                                                                            />
                                                                            <svg
                                                                                style={{
                                                                                    top: `${tag.y - 26}px`,
                                                                                    left: `${tag.x}px`,
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
                                                                            <p
                                                                                style={{
                                                                                    top: `${tag.y - 57}px`,
                                                                                    left: `${tag.x + 130}px`,
                                                                                    position: "absolute",
                                                                                    transform: "translate(-50%, -50%)",
                                                                                    zIndex: "1",
                                                                                    fontSize: "14px",
                                                                                    textDecoration: "underline",
                                                                                    color: "gray"
                                                                                }}
                                                                                onClick={() => handleTagDelete(tag.tagId)}
                                                                            >삭제</p>
                                                                            <p
                                                                                style={{
                                                                                    top: `${tag.y - 67}px`,
                                                                                    left: `${tag.x + 170}px`,
                                                                                    position: "absolute",
                                                                                    transform: "translate(-50%, -50%)",
                                                                                    zIndex: "1",
                                                                                    fontSize: "70px"
                                                                                }}
                                                                                onClick={() => handleTagModal(tag.tagId)}
                                                                            >&rsaquo;</p>
                                                                            {tag.showModal ? (
                                                                                <Paper
                                                                                    style={{
                                                                                        top: `${tag.y - 8}px`,
                                                                                        left: `${tag.x + 316}px`,
                                                                                        position: "absolute",
                                                                                        transform: "translate(-50%, -50%)",
                                                                                        zIndex: "1",
                                                                                        width: "250px",
                                                                                        height: "150px",
                                                                                        backgroundColor: "white"
                                                                                    }}
                                                                                    elevation={3}
                                                                                >
                                                                                    <span style={{ display: "inline-block", float: "left", fontWeight: "bold" }}>링크된 상품</span>
                                                                                    <span
                                                                                        style={{
                                                                                            fontSize: "14px",
                                                                                            fontWeight: 'bold',
                                                                                            color: "#1976d2",
                                                                                            display: "inline-block",
                                                                                            float: "right",
                                                                                        }}
                                                                                        onClick={() => handleOpenLinkModal(tag.tagId)}
                                                                                    >
                                                                                        거래상품 연동하기
                                                                                    </span>
                                                                                    <br />
                                                                                    <br />
                                                                                    <br />
                                                                                    <p>현재 연동된 상품이 없습니다.</p>
                                                                                </Paper>
                                                                            ) : null}
                                                                        </>
                                                                        : null}
                                                                </div>

                                                            );
                                                        })}

                                                    </div>

                                                )}


                                            <br />
                                            <Button variant="contained" onClick={() => handleImgOverlay(field.id)}>태그 추가하기</Button>
                                            <span style={{ display: 'inline-block', marginLeft: "20%" }} onClick={() => handleFileBtn(field.id)}>사진 변경하기<AutorenewIcon fontSize='large' /></span>

                                        </div>
                                    )
                                    :
                                    (
                                        <div style={{
                                            width: '400px',
                                            height: "300px",
                                            backgroundColor: "#F0F0F0",
                                            marginLeft: '30%',
                                            marginTop: '20px',
                                            textAlign: "center"
                                        }}>
                                            <br />
                                            <AddAPhotoIcon fontSize='large' style={{ marginTop: "15%" }} />
                                            <br />
                                            <br />
                                            <p>버튼을 클릭해 사진을 첨부해 보세요.</p>
                                            <Button variant="contained" onClick={() => handleFileBtn(field.id)}>첨부하기</Button>
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
                                    <TextField id="outlined-basic" label="내용을 입력해주세요." variant="outlined" fullWidth multiline rows={5} style={{ marginTop: "20px" }} />
                                </div>
                            </div>
                        )
                    })}
                    <Button variant="contained" style={{ fontSize: "35px", width: "400px", marginTop: "20px", marginLeft: "35%" }} onClick={createNewField}>+</Button>
                </Grid2>
                <Grid2 size={4}>
                </Grid2>

            </Grid2>
            <Modal
                open={showLinkModal}
                onClose={() => setShowLinkModal(false)}
            >
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "700px", backgroundColor: "white" }}>
                    <div style={{ marginTop: "20px", marginLeft: "20px", border: "1px solid gray", width: "80%", display: 'inline-block' }}>
                        <Search  />
                        <Input placeholder='상품명을 입력해주세요' style={{width: "90%"}} disableUnderline/>
                    </div>
                    <ClearIcon fontSize='large' style={{float: "right"}} onClick={() => setShowLinkModal(!showLinkModal) }/>
                    <hr style={{marginBottom: "0"}}/>
                    <TableContainer sx={{ maxHeight: 600 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>상품사진</TableCell>
                                    <TableCell>상품명</TableCell>
                                    <TableCell>상품사진</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>상품사진</TableCell>
                                    <TableCell>상품명</TableCell>
                                    <TableCell>상품사진</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>상품사진</TableCell>
                                    <TableCell>상품명</TableCell>
                                    <TableCell>상품사진</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </Modal>
        </>
    );
}

export default Page;