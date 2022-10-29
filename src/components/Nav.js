import React, { useState } from 'react';
import '../css/Nav.css';
import { useNavigate } from 'react-router-dom/dist';

import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ComputerIcon from '@mui/icons-material/Computer';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import {
    Box,
    Divider,
    IconButton,
    SwipeableDrawer,
    List,
    ListItem,
} from '@mui/material';

const Nav = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-name">Alexi</div>
            <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                <div className="navbar-links">
                    <div
                        className="navbar-button un"
                        onClick={() => navigate('/')}
                    >
                        <HomeOutlinedIcon />
                        Home
                    </div>
                    <div
                        className="navbar-button un"
                        onClick={() => navigate('/about')}
                    >
                        <PersonOutlineOutlinedIcon />
                        About
                    </div>
                    <div
                        className="navbar-button un"
                        onClick={() => navigate('/projects')}
                    >
                        <ComputerIcon />
                        Projects
                    </div>
                </div>
            </Box>
            <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
                {!open ? (
                    <IconButton onClick={() => setOpen(true)}>
                        <ExpandMoreIcon />
                    </IconButton>
                ) : (
                    <div className="empty-icon">{' '}</div>
                )}
            </Box>
            <SwipeableDrawer
                anchor="top"
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
            >
                <div className="nav-expand-less">
                    <IconButton onClick={() => setOpen(false)}>
                        <ExpandLessIcon />
                    </IconButton>
                </div>
                <Divider />
                <List className="nav-hamburger-links">
                    <ListItem
                        onClick={() => {
                            navigate('/');
                            setOpen(false);
                        }}
                        className="un"
                    >
                        <div className="hamburger-button">
                            <HomeOutlinedIcon />
                            Home
                        </div>
                    </ListItem>
                    <ListItem
                        onClick={() => {
                            navigate('/about');
                            setOpen(false);
                        }}
                        className="un"
                    >
                        <div className="hamburger-button">
                            <PersonOutlineOutlinedIcon />
                            About
                        </div>
                    </ListItem>
                    <ListItem
                        onClick={() => {
                            navigate('/projects');
                            setOpen(false);
                        }}
                        className="un"
                    >
                        <div className="hamburger-button">
                            <ComputerIcon />
                            Projects
                        </div>
                    </ListItem>
                </List>
            </SwipeableDrawer>
        </nav>
    );
};

export default Nav;
