import React from 'react';
import Snowfall from 'react-snowfall';
import Tech from '../components/Tech';
import '../css/Projects.css';
const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
};
const Projects = () => {
    const projects = [
        {
            name: 'Sharespace',
            desc:
                'A social media blogging platform like Medium and Dev.to! You have the ability to like, share, comment on every post!',
            tech: ['HTML', 'CSS', 'React', 'Firebase', 'NextJS'],
            image:
                'https://cdn.discordapp.com/attachments/1031098628804182076/1040857388376408064/opera_OjhSHRwQG1.png',
            live: 'https://sharespace.alexi.life',
            repo: 'https://github.com/itsalexi/Sharespace',
        },
        {
            name: 'Discord Clone',
            desc:
                'A discord clone with full authentication and realtime chat messaging powered by Firebase.',
            tech: ['HTML', 'CSS', 'React', 'Firebase', 'JavaScript'],
            image:
                'https://media.discordapp.net/attachments/1031098628804182076/1035907707703660564/Screen_Shot_2022-10-29_at_9.27.05_PM.png?width=2032&height=1005',
            live: 'https://alexi.life/projects/discord-clone/',
            repo: 'https://github.com/itsalexi/Discord-Clone/',
        },
        {
            name: 'Fake Shopping Website',
            desc:
                'A fake shopping website populated with data from a Fake Store API to retrieve products from.',
            tech: ['HTML', 'CSS', 'React', 'JavaScript'],
            image:
                'https://camo.githubusercontent.com/19ede2192e8a1dae046183df5b52934c490ec56874bde55c22d1d317819aade2/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f313032333137383339393837363930373038382f313032333138303133343532373831313538342f53637265656e5f53686f745f323032322d30392d32345f61745f362e33322e32305f504d2e706e673f77696474683d31303831266865696768743d353338',
            live: 'https://alexi.life/projects/Shopping-Website/',
            repo: 'https://github.com/itsalexi/Shopping-Website',
        },
        {
            name: 'Portfolio Website',
            desc:
                'My personal portfolio website. The one your sitting on right now!',
            tech: ['HTML', 'CSS', 'React', 'JavaScript'],
            image:
                'https://media.discordapp.net/attachments/1031098628804182076/1035906171556601896/Screen_Shot_2022-10-29_at_9.20.59_PM.png?width=2032&height=984',
            live: 'https://alexi.life/',
            repo: 'https://github.com/itsalexi/alexi.life/tree/source',
        },
        {
            name: 'Memory Card Game',
            desc:
                "A memory card game built with React! Everytime you press on a card, the board shuffles, remember the one you clicked on and don't click on it again!",
            tech: ['HTML', 'CSS', 'React', 'JavaScript'],
            image:
                'https://media.discordapp.net/attachments/1031098628804182076/1035909078150557696/Screen_Shot_2022-10-29_at_9.32.44_PM.png?width=2032&height=1005',
            live: 'https://alexi.life/projects/Memory-Card/',
            repo: 'https://github.com/itsalexi/Memory-Card',
        },
        {
            name: 'Resume Builder',
            desc:
                'A resume builder built with React! The document is very customizable, you can edit the information by simply pressing what you want to edit and changing it!',
            tech: ['HTML', 'CSS', 'React', 'JavaScript'],
            image:
                'https://camo.githubusercontent.com/6cb2600722f76b02b4a06cbccf94e4a0ba2e7bdfbf256a43b2c8ec092325f8ee/68747470733a2f2f692e6962622e636f2f325a37717654562f696d6167652d323032322d30382d32362d3137323133393930362e706e67',
            live: 'https://alexi.life/projects/CV-Creator/',
            repo: 'https://github.com/itsalexi/CV-Creator',
        },
        {
            name: 'Weather App',
            desc:
                'A weather app built with Vanilla JavaScript! It is powered by the OpenWeatherAPI, you are able to switch how the data is being displayed too!',
            tech: ['HTML', 'CSS', 'JavaScript'],
            image:
                'https://camo.githubusercontent.com/afd5e37c39bf7177e7086b321b38539cf624f3ec851ee87a59cefa8ea59795d2/68747470733a2f2f692e6962622e636f2f4438474a786a422f696d6167652d323032322d30382d30312d3138323632373539362e706e67',
            live: 'https://alexi.life/projects/Weather/',
            repo: 'https://github.com/itsalexi/Weather',
        },
    ];

    return (
        <div className="projects">
            <Snowfall snowflakeCount={50} />
            <div className="projects-main-title">Projects</div>
            <div className="projects-list">
                {projects.map((project) => {
                    return (
                        <div className="project">
                            <img
                                className="project-image"
                                src={project.image}
                                alt="project"
                            />
                            <div className="project-box">
                                <div className="project-info">
                                    <div className="project-title">
                                        {project.name}
                                    </div>
                                    <div className="project-stack">
                                        {project.tech.map((tech) => {
                                            return (
                                                <Tech
                                                    name={tech.toLowerCase()}
                                                />
                                            );
                                        })}
                                    </div>
                                    <div className="project-desc">
                                        {project.desc}
                                    </div>
                                    <div className="project-buttons">
                                        <div
                                            className="project-button live"
                                            onClick={() =>
                                                openInNewTab(project.live)
                                            }
                                        >
                                            <span role="img" aria-label="try">
                                                📥
                                            </span>{' '}
                                            TRY
                                        </div>
                                        <div
                                            className="project-button repo"
                                            onClick={() =>
                                                openInNewTab(project.repo)
                                            }
                                        >
                                            <span role="img" aria-label="repo">
                                                🖥️
                                            </span>{' '}
                                            REPO
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Projects;
