import React from 'react';
import './Library.css';

export const Library: React.FC = () => {
    return (
        <div className="library-container">
            {/* Sidebar Navigation */}
            <aside className="library-sidebar">
                <div className="sidebar-section">
                    <h3 className="sidebar-heading">Collection</h3>
                    <ul className="sidebar-nav">
                        <li>
                            <button className="nav-link active">
                                <span className="material-symbols-outlined">library_music</span>
                                <span>All Sheets</span>
                            </button>
                        </li>
                        <li>
                            <button className="nav-link">
                                <span className="material-symbols-outlined">favorite</span>
                                <span>Favorites</span>
                            </button>
                        </li>
                        <li>
                            <button className="nav-link">
                                <span className="material-symbols-outlined">schedule</span>
                                <span>Recent</span>
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="sidebar-section">
                    <h3 className="sidebar-heading">Categories</h3>
                    <ul className="sidebar-nav">
                        <li>
                            <button className="nav-link category-link">
                                <span className="material-symbols-outlined icon">piano</span>
                                <span>Classical</span>
                            </button>
                        </li>
                        <li>
                            <button className="nav-link category-link">
                                <span className="material-symbols-outlined icon">headphones</span>
                                <span>Contemporary</span>
                            </button>
                        </li>
                        <li>
                            <button className="nav-link category-link">
                                <span className="material-symbols-outlined icon">speed</span>
                                <span>Technical Exercises</span>
                            </button>
                        </li>
                        <li>
                            <button className="nav-link category-link">
                                <span className="material-symbols-outlined icon">movie</span>
                                <span>Soundtracks</span>
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="sidebar-footer">
                    <div className="pro-plan-box">
                        <h4 className="pro-title">Pro Plan</h4>
                        <p className="pro-desc">Unlock unlimited sheets and cloud storage.</p>
                        <button className="btn-upgrade">Upgrade</button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="library-main">
                <div className="library-header">
                    <div className="header-text">
                        <h1 className="page-title">Music Sheets Library</h1>
                        <p className="page-subtitle">Manage and organize your personal collection.</p>
                    </div>
                    {/* Filters */}
                    <div className="filters-group">
                        <button className="btn-filter">
                            <span>BPM Range</span>
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        <button className="btn-filter">
                            <span>Key Signature</span>
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        <button className="btn-filter">
                            <span>Difficulty</span>
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        <button className="btn-icon active">
                            <span className="material-symbols-outlined">grid_view</span>
                        </button>
                        <button className="btn-icon">
                            <span className="material-symbols-outlined">list</span>
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="sheets-grid">
                    {/* New Sheet Card */}
                    <button className="sheet-card new-sheet">
                        <div className="add-icon-wrapper">
                            <span className="material-symbols-outlined text-4xl">add</span>
                        </div>
                        <span className="new-sheet-text">Create New Sheet</span>
                    </button>

                    {/* Sheet Card 1 (Active) */}
                    <article className="sheet-card active-card">
                        <div className="active-badge">Active</div>
                        <div className="sheet-preview" data-alt="Sheet music preview showing simple staves">
                            <img alt="Sheet Music Preview" className="preview-img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDxewzInkryk40oXHaVbd8ipj4N96mtMXimKCp_v3fgqXKrz-NFAZn0R5D7brSq8z9cjplNWZ6GBB00Hzi3MeFrJ3fpUHZt-E5-ARRtg-Z6EE3lub4WKLViSMb1acH7wC06BBgs_ZJg9LE73BeVcPGUoAWge_oqCtAxBQnV8475VHnJ8dg-QuxAy33ilfW3HgZ8xhAr3s6VBvQc2Vak2vecEXaFayX12c5Vv2Gr2LSqKkXHMc81WOe2CFB2d7yRsIy8-hoHEc_yFw" />
                            <div className="preview-overlay">
                                <div className="play-btn">
                                    <span className="material-symbols-outlined text-black">play_arrow</span>
                                </div>
                            </div>
                        </div>
                        <div className="sheet-info">
                            <div className="sheet-titles">
                                <h3 className="sheet-title">Moonlight Sonata</h3>
                                <p className="sheet-composer">L.V. Beethoven</p>
                            </div>
                            <div className="sheet-meta">
                                <div className="meta-col">
                                    <span className="meta-label">BPM</span>
                                    <span className="meta-val">54</span>
                                </div>
                                <div className="meta-col border-left">
                                    <span className="meta-label">Key</span>
                                    <span className="meta-val">C#m</span>
                                </div>
                                <div className="meta-col border-left">
                                    <span className="meta-label">Dur</span>
                                    <span className="meta-val">5:12</span>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Sheet Card 2 */}
                    <article className="sheet-card hover-effect">
                        <div className="sheet-preview" data-alt="Sheet music preview">
                            <img alt="Sheet Music Preview" className="preview-img off-img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCAnknuRXe3hEKm9926-2zpcpFWiDwZ_PZaOH9lJhbKx8sMyNk9_n4UqwJb9sNS3oTmi_4nmL7jLL05dr2c4qgBob2ic-nLkwP8ZylfJXIQj5LNiaPy5aIeczaTKd5jDP3y1lrs3kQbC6g535OWoQAcdPB2qMRB5_FrI4zq710I7edU0gxd-6aCnjdIHB9LEjUVW0uwpgZSvOf6Dh4Upd38pxxX8dE9Bgk_T1E8YPb7ch1ZjXmV0DhQBGONmkRRH_3QCi10gD4PYY" />
                            <div className="preview-overlay">
                                <div className="play-btn">
                                    <span className="material-symbols-outlined text-black">edit</span>
                                </div>
                            </div>
                        </div>
                        <div className="sheet-info">
                            <div className="sheet-titles">
                                <h3 className="sheet-title">Clair de Lune</h3>
                                <p className="sheet-composer">C. Debussy</p>
                            </div>
                            <div className="sheet-meta">
                                <div className="meta-col">
                                    <span className="meta-label">BPM</span>
                                    <span className="meta-val">60</span>
                                </div>
                                <div className="meta-col border-left">
                                    <span className="meta-label">Key</span>
                                    <span className="meta-val">Db</span>
                                </div>
                                <div className="meta-col border-left">
                                    <span className="meta-label">Dur</span>
                                    <span className="meta-val">4:30</span>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Sheet Card 3 */}
                    <article className="sheet-card hover-effect">
                        <div className="sheet-preview" data-alt="Sheet music preview">
                            <img alt="Sheet Music Preview" className="preview-img off-img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAialkHtF2TmkfVzVQTo8Ygz9ehJOc1P3_PR4CrNfrTltaBphJwjuM4TGOu1T1r-Q3GUrdk4Wav2KoFZe17hk7CrmvXruTLRyNaMaiZSbQijtLh_5NJ4Utn7kCIRuqXfq9fulmJOicJ72-r5DSTPRH7eXZgPcM1OiN30pkPAQ5qGXFssedKPlyQ2D931rYrq_8UyCBDqPk1YAHTLgWXZ2MyN39VmtyxEqhOR9eHjHL7JkK_iXl9g3nqHrdVX-5C5k5VAL1y06sWdg" />
                            <div className="preview-overlay">
                                <div className="play-btn">
                                    <span className="material-symbols-outlined text-black">edit</span>
                                </div>
                            </div>
                        </div>
                        <div className="sheet-info">
                            <div className="sheet-titles">
                                <h3 className="sheet-title">Gymnopédie No.1</h3>
                                <p className="sheet-composer">E. Satie</p>
                            </div>
                            <div className="sheet-meta">
                                <div className="meta-col">
                                    <span className="meta-label">BPM</span>
                                    <span className="meta-val">48</span>
                                </div>
                                <div className="meta-col border-left">
                                    <span className="meta-label">Key</span>
                                    <span className="meta-val">D</span>
                                </div>
                                <div className="meta-col border-left">
                                    <span className="meta-label">Dur</span>
                                    <span className="meta-val">3:15</span>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Sheet Card 4 */}
                    <article className="sheet-card hover-effect">
                        <div className="sheet-preview" data-alt="Sheet music preview">
                            <img alt="Sheet Music Preview" className="preview-img off-img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATs3mtgIuYDvEZKh3wuYrvOv_JNqy23vQZy9KQi6wE_4OY261KghGuqZ0Q0AHJ89GnrkYvnZSnrCxyf9LvEpgd2pVaO_GQ8mU5E_Rxb8t9s5MVndhuT5IhPUu-y7vnl1aDMZ6bLRr68chduknOchmZpHJ4vRLIdVqHo_mTLWQdELc-owd0wESZ4bCQ_Kmc6CEee942hYWjCxnfHD8VIbI8K2T5sIz4bH7jsTtOfDNjVBFDyi2ZcKZaSXyP3peNhaakbpIU-7YIgaA" />
                            <div className="preview-overlay">
                                <div className="play-btn">
                                    <span className="material-symbols-outlined text-black">edit</span>
                                </div>
                            </div>
                        </div>
                        <div className="sheet-info">
                            <div className="sheet-titles">
                                <h3 className="sheet-title">River Flows In You</h3>
                                <p className="sheet-composer">Yiruma</p>
                            </div>
                            <div className="sheet-meta">
                                <div className="meta-col">
                                    <span className="meta-label">BPM</span>
                                    <span className="meta-val">64</span>
                                </div>
                                <div className="meta-col border-left">
                                    <span className="meta-label">Key</span>
                                    <span className="meta-val">A</span>
                                </div>
                                <div className="meta-col border-left">
                                    <span className="meta-label">Dur</span>
                                    <span className="meta-val">3:45</span>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Sheet Card 5 */}
                    <article className="sheet-card hover-effect">
                        <div className="sheet-preview" data-alt="Sheet music preview">
                            <img alt="Sheet Music Preview" className="preview-img off-img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXQmmxHn7kDhCoMQreslfd2YxH5h7Br196Ufw4VkXfqaLJT74kiIsZ0OhZhTB28ZPCu7KQWkww6N7VJrX59M4MDMH-OXQZJLVROdyc6M7FwSyU3HGvGDo4Bjr4thE8ADn6KmWd4Y4yG70YcJZdK7HCnwxT1af3Olm9VwvxoS5D6qFWUPxwpCEnk8Uq3u9liSmac97I3QslckNCxMAOIcG1Xg3zwBg1S1KfhyYchaQ-d8_V7UJTyXl11gNOBMl3DMi--IXFvYEKUUs" />
                            <div className="preview-overlay">
                                <div className="play-btn">
                                    <span className="material-symbols-outlined text-black">edit</span>
                                </div>
                            </div>
                        </div>
                        <div className="sheet-info">
                            <div className="sheet-titles">
                                <h3 className="sheet-title">Hanon Exercise No. 1</h3>
                                <p className="sheet-composer">C.L. Hanon</p>
                            </div>
                            <div className="sheet-meta">
                                <div className="meta-col">
                                    <span className="meta-label">BPM</span>
                                    <span className="meta-val">108</span>
                                </div>
                                <div className="meta-col border-left">
                                    <span className="meta-label">Key</span>
                                    <span className="meta-val">C</span>
                                </div>
                                <div className="meta-col border-left">
                                    <span className="meta-label">Dur</span>
                                    <span className="meta-val">1:20</span>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Sheet Card 6 */}
                    <article className="sheet-card hover-effect">
                        <div className="sheet-preview" data-alt="Sheet music preview">
                            <img alt="Sheet Music Preview" className="preview-img off-img" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTB3vvfjtjpgCVfhVdoVv1w1ogOTDAhe_eGj-KB_iYsDs_4Gwh2rvc-uEte1QrOtZ5zh39N0TF1cXIhPpJ5zajhAW5-YPsYkp0KAURzxrw_6Q17Z6AITTRbRHDCfH5YtkO1NMQ3Bp_rcchk1vFS1BmxqmZPcgGFsypN5JLYKljW88pRMXB0kz3O-V6gnGkg3pPeI82qfBiPRr6_H_gHUWQeHOO4TeGYxfFnE4fEIzsqducS0gyEhN7CsrrU-h8I7db7GwBVohlZQE" />
                            <div className="preview-overlay">
                                <div className="play-btn">
                                    <span className="material-symbols-outlined text-black">edit</span>
                                </div>
                            </div>
                        </div>
                        <div className="sheet-info">
                            <div className="sheet-titles">
                                <h3 className="sheet-title">Nocturne in E Flat</h3>
                                <p className="sheet-composer">F. Chopin</p>
                            </div>
                            <div className="sheet-meta">
                                <div className="meta-col">
                                    <span className="meta-label">BPM</span>
                                    <span className="meta-val">68</span>
                                </div>
                                <div className="meta-col border-left">
                                    <span className="meta-label">Key</span>
                                    <span className="meta-val">Eb</span>
                                </div>
                                <div className="meta-col border-left">
                                    <span className="meta-label">Dur</span>
                                    <span className="meta-val">4:10</span>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>

                {/* Pagination */}
                <div className="library-pagination">
                    <span className="pagination-info">Showing 6 of 124 sheets</span>
                    <div className="pagination-controls">
                        <button className="btn-page" disabled>PREVIOUS</button>
                        <button className="btn-page">NEXT</button>
                    </div>
                </div>
            </main>
        </div>
    );
};
