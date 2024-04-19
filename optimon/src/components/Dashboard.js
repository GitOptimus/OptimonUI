import React,{ useContext, useState, useEffect } from "react";
import {Container,Row , Col} from 'react-bootstrap';
import EndpointService from "../services/endpointService";
import './Dashboard.css';
import InboundServiceList from "./inboundServiceList";
import QueuesList from "./queuesList";
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
//import SettingsIcon from '@mui/icons-material/Settings';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import { ThemeContext } from "../themeContext";
import moment from "moment";

import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import CloudCircleOutlinedIcon from '@mui/icons-material/CloudCircleOutlined';
import CloudCircleRoundedIcon from '@mui/icons-material/CloudCircleRounded';


import SettingsIcon from '@mui/icons-material/Settings';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

import { MaterialUISwitch } from '../components/MaterialUISwitch';

const Dashboard = (props) => {

  const [trustOneData, setTrustOneData] = useState();
  const [trustTwoData, setTrustTwoData] = useState();
  const [trustThreeData, setTrustThreeData] = useState();
  const [showTrustFourData, setShowTrustFourData] = useState(false);
  const [loadingTrust, setLoadingTrust] = useState(false);
  const [refreshTime, setRefreshTime] = useState(10);
  const [queueWarningLimit, setQueueWarningLimit] = useState(100);
  const [serviceDelayTimeLimit, setServiceDelayTimeLimit] = useState(100);
  const [time, setTime] = useState(Date.now());

  const { theme, toggleTheme,setLatestTime, isOnPremServer, setIsOnPremServer } = useContext(ThemeContext);


  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState();

  useEffect(() => {
    refreshAllData()
  }, [isOnPremServer]);

  useEffect(() => {
    const interval = setInterval(() => refreshAllData(), refreshTime *1000);
    return () => {clearInterval(interval)};
  }, [refreshTime,isOnPremServer]);
  
  
  const refreshAllData = () => {
    console.log({isOnPremServer});
    setTime(Date.now())
    setLoadingTrust(true);
    Promise.all([
    retrieveTrustData(isOnPremServer ? 4 : 1,setTrustOneData),
    retrieveTrustData(isOnPremServer ? 5 : 2,setTrustTwoData),
    retrieveTrustData(isOnPremServer ? 6 : 3,setTrustThreeData)])
    //retrieveTrustData(isOnPremServer ? 6 : 6,setTrustFourData)])
    .then(() => { 
      setLoadingTrust(false)
    });
  }

  const handleClick = (newPlacement) => (event) => {
    setAnchorEl(event.currentTarget);
    setOpen((prev) => placement !== newPlacement || !prev);
    setPlacement(newPlacement);
  };

  const handleEnvChange = (isOnPrem) => {
    console.log('clicking', isOnPrem);
    setIsOnPremServer(isOnPrem)
  }

  const retrieveTrustData = (id, setState) => {

    EndpointService.getTrustData(id)
      .then(response => {
        if(id==1 && response.data){
          setLatestTime(response.data.queueDetails[0].createdOn)
        }
        console.log(response.data);
        setState(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  };

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    boxShadow: 24,
    bgcolor: 'background.paper',
    p: 1,
  };
  
  return (
    <div className="mainDashbaordContainer">
      <Container fluid className="fullHeight">
        <Row className="fullHeight">
          <Col>
              { <Modal
                open={loadingTrust}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box sx={style}><CircularProgress size={40} color="secondary"/></Box>
                </Modal> 
              }
              <Row className="fullHeight">
                {/* Trust one */}
                {(trustOneData?.queueDetails || trustOneData?.inboundDetails) && 
                  <Col>
                  {trustOneData?.queueDetails &&
                    <Row className="halfHeight">
                      <div style={{display: "flex", justifyContent:'space-between'}}>
                        <div style={{display: "flex", justifyContent: 'space-between', alignItems: 'center'}} >
                          <p><strong>LNWUH-{isOnPremServer ? 'OnPrem': 'Cloud'}({trustOneData?.queueDetails.length >0 ?  moment(trustOneData?.queueDetails[0].createdOn).format("lll"): ""} )</strong></p>
                        </div>
                        <div style={{marginLeft:'20px'}}>
                          <MonitorHeartIcon sx={{ fontSize: 40 }} color={trustOneData?.queueDetails.length >0 && moment().diff(moment(trustOneData.queueDetails[0].createdOn),'minutes') < 5 ? 'success' : 'error'} />
                        </div>
                      </div>
                      {trustOneData?.queueDetails && <QueuesList data={trustOneData.queueDetails} limit={queueWarningLimit}/>}
                    </Row>
                  }
                  { trustOneData?.inboundDetails &&
                    <Row className="halfHeight">
                    <div style={{display: "flex", justifyContent: 'space-between', alignItems: 'center'}} >
                      <p><strong>EndPoints ({trustOneData?.inboundDetails.length >0 ?  moment(trustOneData?.inboundDetails[0].createdOn).format("lll") :""}  )</strong></p>
                    </div>
                      {trustOneData?.inboundDetails && <InboundServiceList data={trustOneData.inboundDetails} limit={serviceDelayTimeLimit}/>}
                    </Row>
                  }
                  </Col>
                }

                {/* Trust two */}
                {(trustTwoData?.queueDetails || trustTwoData?.inboundDetails) && 
                  <Col>
                  {trustTwoData?.queueDetails && 
                    <Row className="halfHeight">
                    <div style={{display: "flex", justifyContent:'space-between'}}>
                      <div style={{display: "flex", justifyContent: 'space-between', alignItems: 'center'}} >
                        <p><strong>THH-{isOnPremServer ? 'OnPrem': 'Cloud'}({trustTwoData?.queueDetails.length >0 ? moment(trustTwoData?.queueDetails[0].createdOn).format("lll"):""}  )</strong></p>
                      </div>
                      <div style={{marginLeft:'20px'}}>
                          <MonitorHeartIcon sx={{ fontSize: 40 }} color={trustTwoData?.queueDetails.length >0 && moment().diff(moment(trustTwoData.queueDetails[0].createdOn),'minutes') < 5 ? 'success' : 'error'}/>
                        </div>
                      </div>
                      {trustTwoData?.queueDetails && <QueuesList data={trustTwoData.queueDetails} limit={queueWarningLimit}/>}
                    </Row>
                  }
                  {trustTwoData?.inboundDetails && 
                    <Row className="halfHeight">
                    <div style={{display: "flex", justifyContent: 'space-between', alignItems: 'center'}} >
                      <p><strong>EndPoints ({trustTwoData?.inboundDetails.length >0 ?  moment(trustTwoData?.inboundDetails[0].createdOn).format("lll"):""} )</strong></p>
                    </div>
                      {trustTwoData?.inboundDetails && <InboundServiceList data={trustTwoData.inboundDetails} limit={serviceDelayTimeLimit}/>}
                    </Row>
                  }
                  </Col>
                }

                {/* Trust three */}
                {(trustThreeData?.queueDetails || trustThreeData?.inboundDetails) && 
                  <Col>
                  {trustThreeData?.queueDetails && 
                    <Row className="halfHeight">
                    <div style={{display: "flex", justifyContent:'space-between'}}>
                      <div style={{display: "flex", justifyContent: 'space-between', alignItems: 'center'}} >
                        <p><strong>{isOnPremServer ? 'NWL-Cloud': 'ICHNT-Cloud'}({trustThreeData?.queueDetails.length >0 ? moment(trustThreeData?.queueDetails[0].createdOn).format("lll"):""}  )</strong></p>
                      </div>
                      <div style={{marginLeft:'20px'}}>
                          <MonitorHeartIcon sx={{ fontSize: 40 }} color={trustThreeData?.queueDetails.length >0 && moment().diff(moment(trustThreeData.queueDetails[0].createdOn),'minutes') < 5 ? 'success' : 'error'}/>
                        </div>
                      </div>
                      {trustThreeData?.queueDetails && <QueuesList data={trustThreeData.queueDetails} limit={queueWarningLimit}/>}
                    </Row>
                  }
                  {trustThreeData?.inboundDetails && 
                    <Row className="halfHeight">
                    <div style={{display: "flex", justifyContent: 'space-between', alignItems: 'center'}} >
                      <p><strong>EndPoints ({trustThreeData?.inboundDetails.length >0 ?  moment(trustThreeData?.inboundDetails[0].createdOn).format("lll"):""} )</strong></p>
                    </div>
                      {trustThreeData?.inboundDetails && <InboundServiceList data={trustThreeData.inboundDetails} limit={serviceDelayTimeLimit}/>}
                    </Row>
                  }
                  </Col>
                }
                {/* Trust Four */}
                { showTrustFourData &&
                <Col>
                  <Row className="halfHeight">
                    <p><strong>CWFT-Cloud({trustThreeData?.queueDetails.length >0 ? moment(trustThreeData?.queueDetails[0].createdOn).format("111"):""} )</strong></p>
                    {trustThreeData?.queueDetails && <QueuesList data={trustThreeData.queueDetails}/>}
                  </Row>
                  <Row className="halfHeight">
                  <div style={{display: "flex", justifyContent: 'space-between', alignItems: 'center'}} >
                    <p><strong>EndPoints({trustThreeData?.inboundDetails.length >0 ? moment(trustThreeData?.inboundDetails[0].createdOn).format("111"):""} )</strong></p>
                  </div>
                    {trustThreeData?.inboundDetails && <InboundServiceList data={trustThreeData.inboundDetails} limit={serviceDelayTimeLimit} />}
                  </Row>
                </Col>
                }
              </Row>
          </Col>
          <Col md='auto' style={{paddingRight:'0px'}}>
            <div style={{borderLeft:'1px solid black', minHeight:'99%'}}>
              <div>
                <IconButton onClick={() => handleEnvChange(true)}>
                  {isOnPremServer ? <DnsRoundedIcon color="info"/> : <DnsOutlinedIcon color="info"/>}
                </IconButton>
              </div>
              <div>
                <IconButton onClick={() => handleEnvChange(false)}>
                  {isOnPremServer ? <CloudCircleOutlinedIcon color="info"/> : <CloudCircleRoundedIcon color="info"/> }
                </IconButton>
              </div>
              <div>
                <IconButton onClick={handleClick('bottom-end')}>
                  {open ? <SettingsIcon color="info"/>  : <SettingsOutlinedIcon color="info"/>}
                </IconButton>
              </div>
            </div>
          </Col>
        </Row>
      
      
      </Container> 

      <Popper open={open} anchorEl={anchorEl} placement={placement} transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper elevation={24}>
              <Typography sx={{ p: 2 }}>
                <div className="settingsHeaderContainer"><div>Settings</div>
                <button className='buttonStyle' onClick={toggleTheme}>
                  <MaterialUISwitch sx={{ m: 2 }} defaultChecked={ theme === 'dark'} />
                </button>
                </div>
                
                <div>
                  <TextField 
                    label="Refresh Time(Secs)" 
                    fullWidth
             
                    size="small"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    value={refreshTime}
                    onChange={(event) => {
                      if(!isNaN(event.target.value))
                      {
                        setRefreshTime(event.target.value);
                      }
                    }}
                  />
                </div>

                <div className="mt-3">
                  <TextField 
                    label="Queue Count Warning Limit" 
                    fullWidth
                    size="small"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    value={queueWarningLimit}
                    onChange={(event) => {
                      if(!isNaN(event.target.value))
                      {
                        setQueueWarningLimit(event.target.value);
                      }
                    }}
                  />
                </div>

                <div className="mt-3">
                  <TextField 
                    label="Service Delay Time Limit (Mins)" 
                    fullWidth
                    size="small"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    value={serviceDelayTimeLimit}
                    onChange={(event) => {
                      if(!isNaN(event.target.value))
                      {
                        setServiceDelayTimeLimit(event.target.value);
                      }
                    }}
                  />
                </div>
              </Typography>
            </Paper>
          </Fade>
        )}
      </Popper>
    </div>
  );
};

export default Dashboard;





