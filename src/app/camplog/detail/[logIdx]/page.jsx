"use client"
import { CircularProgress, Grid2, Paper } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeIcon from '@mui/icons-material/Mode';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { CSSTransition } from 'react-transition-group';
import './page.css';

function Page({ params }) {
    const baseUrl = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;
    const imgUrl = process.env.NEXT_PUBLIC_LOCAL_IMG_URL;
    const userIdx = 1;
    const router = useRouter();
    const [isIconHover, setIsIconHover] = useState(false);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isWriter, setIsWriter] = useState(false);
    const [toggleIcon, setToggleIcon] = useState(false);
    const [tagData, setTagData] = useState([{tagId: ""}]);
    const [isShow, setIsShow] = useState(false);
    const [clickedTag, setClickedTag] = useState({});
    const [isLinkShow, setIsLinkShow] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { logIdx } = await Promise.resolve(params);
                console.log("logIdx: ", logIdx);

                const apiUrl = `${baseUrl}/camplog/detail?logIdx=${logIdx}&userIdx=${userIdx}`;
                const response = await axios.get(apiUrl);
                console.log("response: ", response);
                const data = response.data;
                if (data.success) {
                    setData(data.data);
                    setTagData(data.data.pData.map(item => item.tagData));
                } else {
                    alert(response.data.message);
                    router.push("/camplog/list");
                }
            } catch (error) {
                console.error(error);
                router.push("/camplog/list");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [params, baseUrl]);
    console.log("tagData: ", tagData)

    const showTagContent = (tagId, order) => {
        const clickedTag = tagData[order].filter(tag => tag.tagId === tagId );
        setClickedTag(clickedTag.map(tag => {
            return(
                {
                    ...tag, 
                    tagX: parseFloat(clickedTag[0].tagX), 
                    tagY: parseFloat(clickedTag[0].tagY), 

                }
            )
        }));
        setIsShow(!isShow);
    }
    return (
        <Grid2 container spacing={0} >
            <Grid2 size={3} />
            <Grid2 textAlign={'center'} size={6}>
                {isLoading > 0 ?
                    (<CircularProgress style={{ margin: "300px" }} />)
                    :
                    (<>
                        <div style={{ width: '100%', height: "300px", margin: "80px auto", border: "1px solid gray", display: "flex", flexDirection: "column" }}>
                            <div style={{ height: "70%" }}>
                                <p style={{ fontSize: "50px", margin: "40px auto" }}>{data.logVO.logTitle}</p>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 0 20px", width: "100%" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="48" fill="#ccc" stroke="#999" strokeWidth="2" />
                                        <circle cx="50" cy="40" r="20" fill="#fff" />
                                        <circle cx="42" cy="38" r="2" fill="#000" />
                                        <circle cx="58" cy="38" r="2" fill="#000" />
                                        <path d="M40 50 Q50 60 60 50" stroke="#000" strokeWidth="2" fill="none" />
                                    </svg>
                                    <span style={{ fontWeight: "bold" }}>{data.userVO.userNickname}</span>
                                    <span style={{ color: "gray" }}>{data.logVO.logRegDate}</span>
                                </div>

                                <div style={{ position: "relative", width: "auto" }}>
                                    <MoreVertIcon
                                        fontSize="large"
                                        style={{ color: isIconHover ? "#333333" : "#A9A9A9", marginRight: "30px" }}
                                        onMouseOver={() => setIsIconHover(true)}
                                        onMouseOut={() => setIsIconHover(false)}
                                        onClick={() => setToggleIcon(!toggleIcon)}
                                    />
                                    {isWriter ?
                                        (
                                            <>
                                                {toggleIcon &&
                                                    <>
                                                        <div style={{ position: "absolute", transform: "translate(-50%, -50%)", left: "110px", top: "70px", width: "190px", height: "60px", display: "flex", justifyContent: "start", border: "1px solid gray", backgroundColor: "white" }} >
                                                            <span style={{ color: "gray", margin: "17px 67px 0px 10px", fontWeight: "bold", }}>수정하기</span>
                                                            <ModeIcon style={{ fontSize: "30px", marginTop: "13px" }} />
                                                        </div>
                                                        <div style={{ position: "absolute", transform: "translate(-50%, -50%)", left: "110px", top: "130px", width: "190px", height: "60px", display: "flex", justifyContent: "start", border: "1px solid gray", borderTop: "none", backgroundColor: "white" }} >
                                                            <span style={{ color: "gray", margin: "17px 67px 0px 10px", fontWeight: "bold" }}>삭제하기</span>
                                                            <DeleteIcon style={{ fontSize: "30px", marginTop: "13px" }} />
                                                        </div>
                                                    </>
                                                }
                                            </>
                                        )
                                        :
                                        (
                                            <>
                                                {toggleIcon &&
                                                    <>
                                                        <div style={{ position: "absolute", transform: "translate(-50%, -50%)", left: "110px", top: "70px", width: "190px", height: "60px", display: "flex", justifyContent: "start", border: "1px solid gray", backgroundColor: "white" }} >
                                                            <span style={{ color: "gray", margin: "17px 67px 0px 10px", fontWeight: "bold" }}>신고하기</span>
                                                            <img src='/images/siren-siren-svgrepo-com.svg' alt="" width="28px" ></img>
                                                        </div>
                                                    </>
                                                }
                                            </>
                                        )}
                                </div>
                            </div>
                        </div>
                        {data.pData.map(field => {
                            return (
                                <div key={field.order} style={{ margin: "50px auto", textAlign: "center" }}>
                                    <div style={{ display: "inline-block",maxWidth: "100%", margin: "50px auto", position: "relative" }}>
                                        <img
                                            alt=''
                                            src={`${imgUrl}/${field.fileName}`}
                                            style={{ width: "100%", maxWidth: "100%"}} // 크기 제한
                                        />
                                        {(tagData &&  field.order > 0) && (
                                            <>
                                                {Array.from(tagData)[field.order].map(tag => {
                                                    return (
                                                        <div key={tag.tagId}>
                                                        <div onClick={() => showTagContent(tag.tagId, field.order)}>
                                                        <AddCircleIcon
                                                        style={{
                                                            top: `${tag.tagY}px`,
                                                            left: `${tag.tagX}px`,
                                                            position: "absolute",
                                                            transform: "translate(-50%, -50%)",
                                                            zIndex: 1
                                                        }}
                                                                    color="primary"
                                                                    fontSize="large"
                                                                />
                                                                <div
                                                                style={{
                                                                    top: `${tag.tagY}px`,
                                                                    left: `${tag.tagX}px`,
                                                                    position: "absolute",
                                                                    transform: "translate(-50%, -50%)",
                                                                    width: "14px",
                                                                    height: "14px",
                                                                    backgroundColor: "white"
                                                                }}
                                                                />
                                                            </div>
                                                            {isShow && tag.tagId === clickedTag[0].tagId && (
                                                                 <CSSTransition in={isShow} timeout={500} classNames="fade"  unmountOnExit>
                                                                 <div>
                                                                     <div
                                                                         style={{
                                                                             top: `${parseFloat(clickedTag[0].tagY) - 57}px`,
                                                                             left: `${parseFloat(clickedTag[0].tagX)}px`,
                                                                             position: "absolute",
                                                                             transform: "translate(-50%, -50%)",
                                                                             width: "300px",
                                                                             height: "50px",
                                                                             backgroundColor: "white",
                                                                             zIndex: "1",
                                                                             display: "flex",
                                                                             justifyContent: "flex-start",
                                                                             alignItems: "center",
                                                                             border: "1px solid lightgray", 
                                                                             justifyContent: "space-between", 

                                                                         }}
                                                                     >
                                                                        <p style={{margin: "10px"}}>{clickedTag[0].tagContent}</p>
                                                                         <p
                                                                             style={{
                                                                                 zIndex: "1",
                                                                                 fontSize: "70px",
                                                                                 cursor: "pointer", 
                                                                                 textAlign: 'right', 
                                                                                 marginRight: "7px"
                                                                             }}
                                                                             onClick={() => setIsLinkShow(!isLinkShow)}
                                                                         >&rsaquo;</p>
                                                                     </div>
                                                                     <svg
                                                                         style={{
                                                                             top: `${clickedTag[0].tagY - 26}px`,
                                                                             left: `${clickedTag[0].tagX}px`,
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
                                                                     {isShow && isLinkShow && (
                                                                         <Paper
                                                                             style={{
                                                                                 top: `${clickedTag[0].tagY + 7}px`,
                                                                                 left: `${clickedTag[0].tagX + 300}px`,
                                                                                 position: "absolute",
                                                                                 transform: "translate(-50%, -50%)",
                                                                                 zIndex: "1",
                                                                                 width: "300px",
                                                                                 height: "180px",
                                                                                 backgroundColor: "white", 

                                                                             }}
                                                                             elevation={3}
                                                                         >
                                                                             <span style={{ display: "inline-block", float: "left", fontWeight: "bold", fontSize: "18px", margin: "5px" }}>링크된 상품</span>
                                                                             <br />
                                                                             <br />
                                                                             {clickedTag.dealIdx > 0  ?
                                                                                 (
                                                                                     <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                                                                         <img src={`${imgUrl}/${data.data.fNameByDealIdx[clickedTag.dealIdx]}`}
                                                                                             alt=''
                                                                                             style={{ width: '45%', height: '110px', display: "inline-block", margin: "10px 0 10px 10px" }}>
                                                                                         </img>
                                                                                         <div style={{ width: '55%', height: '110px', display: "block", margin: "10px" }}>
                                                                                             <p style={{ wordWrap: "break-word", wordBreak: "break-all", fontWeight: 'bold', fontSize: "20px", marginBottom: "20px" }}>
                                                                                                 {data.dealVO.filter(list => list.dealIdx ===clickedTag.dealIdx).map(list => list.dealTitle)}
                                                                                             </p>
                                                                                             <p style={{ wordWrap: "break-word", wordBreak: "break-all", fontWeight: 'bold', fontSize: "17px" }}>
                                                                                                 {handleCurrencyToWon(data.dealVO.filter(list => list.dealIdx === clickedTag.dealIdx).map(list => list.dealTitle))}원
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
                                                                     )}
                                                                 </div>
                                                             </CSSTransition>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </div>
                                    {field.logContent ?
                                        field.logContent.split('\n').map((line, index) => (
                                            <span key={index} style={{ display: "block", }}>{line}</span>
                                        )) : null
                                    }
                                </div>
                            );
                        })}
                        <div style={{ width: "50px", height: "50px", margin: "50px auto", border: "1px solid #1976D2", display: "inline-block" }}>
                            <ThumbUpOffAltIcon color='primary' style={{ fontSize: "40px", marginTop: "5px" }} />
                        </div>
                        <span style={{ display: "inline-block", fontSize: "25px", fontWeight: "bold", marginLeft: "30px", verticalAlign: "middle" }}>글 추천하기</span>
                    </>)}

            </Grid2>
            <Grid2 size={3} />
        </Grid2>
    );
}

export default Page;