import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import toast, { Toaster } from 'react-hot-toast';

function GalleryForm({ gallery, onBack }) {
    const [title, setTitle] = useState(gallery?.title ?? '');
    const [description, setDescription] = useState(gallery?.description ?? '');
    const [status, setStatus] = useState(gallery?.status ?? 1);
    const [images, setImages] = useState(
        gallery?.images?.map(img => ({ type: 'existing', value: img })) || [{ type: 'new', value: null }]
    );

    const addImage = () => setImages([...images, { type: 'new', value: null }]);
    const removeImage = (i) => setImages(images.filter((_, index) => index !== i));
    const handleNewFileChange = (e, index) => {
        const file = e.target.files[0];
        const updated = [...images];
        updated[index] = { type: 'new', value: file };
        setImages(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = gallery ? `/gallery/${gallery.id}/update` : '/gallery/store';

        try {
            const res = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'Accept': 'application/json'
                }
            });

            if (res.ok) {
                const updatedGallery = await res.json();
                toast.success(gallery ? 'Gallery updated' : 'Gallery created');
                onBack(updatedGallery);
            } else {
                toast.error('Error saving gallery');
            }
        } catch (error) {
            toast.error('Server error');
        }
    };

    return (
        <div className="card shadow-sm p-4 mb-4">
            <button className="btn btn-outline-secondary mb-3" onClick={() => onBack(null)}>
                ← Back to List
            </button>

            <h3 className="mb-4">{gallery ? 'Edit Gallery' : 'Create Gallery'}</h3>

            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]').content} />

                <div className="mb-3">
                    <label className="form-label" htmlFor="title">Title</label>
                    <input
                        id="title"
                        type="text"
                        name="title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="form-control"
                        placeholder="Enter title"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="form-control"
                        placeholder="Enter description"
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Images</label>
                    {images.map((imgObj, index) => (
                        <div key={index} className="d-flex align-items-center mb-2 p-2 border rounded bg-light">
                            <input
                                type="file"
                                name="images[]"
                                className="form-control"
                                onChange={(e) => handleNewFileChange(e, index)}
                            />
                            {imgObj.type === 'existing' && (
                                <>
                                    <img src={`/storage/${imgObj.value}`} width="50" height="50" className="ms-2 rounded object-fit-cover" />
                                    <input type="hidden" name="existing_images[]" value={imgObj.value} />
                                </>
                            )}
                            <button type="button" className="btn btn-danger ms-2" onClick={() => removeImage(index)}>Remove</button>
                        </div>
                    ))}
                    <button type="button" className="btn btn-secondary mt-2" onClick={addImage}>+ Add Image Row</button>
                </div>

                <div className="mb-4">
                    <label className="form-label" htmlFor="status">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={status}
                        className="form-select"
                        onChange={e => setStatus(e.target.value)}
                    >
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>
                </div>

                <button type="submit" className="btn btn-primary w-100">{gallery ? 'Update Gallery' : 'Save Gallery'}</button>
            </form>
        </div>
    );
}

function GalleryIndex({ galleries }) {
    const [list, setList] = useState(galleries);
    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [sort, setSort] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [editingGallery, setEditingGallery] = useState(null);
    const [addingGallery, setAddingGallery] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [lightboxImg, setLightboxImg] = useState(null);
    const perPage = 4;

    useEffect(() => {
        if (searchQuery.length > 1) {
            setIsSearching(true);
            const delayDebounceFn = setTimeout(() => {
                fetch(`/gallery/live-search?query=${searchQuery}`)
                    .then(res => res.json())
                    .then(data => {
                        setSuggestions(data);
                        setIsSearching(false);
                    });
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setSuggestions([]);
            setIsSearching(false);
        }
    }, [searchQuery]);

    const filteredList = list
        .filter(g =>
            (g.title.toLowerCase().includes(search.toLowerCase()) || search === '') &&
            (statusFilter === '' || g.status?.toString() === statusFilter)
        )
        .sort((a, b) => {
            if (sort === 'asc') return a.title.localeCompare(b.title);
            if (sort === 'desc') return b.title.localeCompare(a.title);
            return 0;
        });

    const totalPages = Math.ceil(filteredList.length / perPage);
    const paginatedData = filteredList.slice((currentPage - 1) * perPage, currentPage * perPage);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure to delete?')) return;
        try {
            const res = await fetch(`/gallery/${id}/delete`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content }
            });
            if (res.ok) {
                setList(list.filter(g => g.id !== id));
                toast.success('Deleted successfully');
            }
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.length} selected items?`)) return;
        try {
            const res = await fetch('/gallery/bulk-delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ ids: selectedIds })
            });
            if (res.ok) {
                setList(list.filter(g => !selectedIds.includes(g.id)));
                setSelectedIds([]);
                toast.success('Bulk delete successful');
            }
        } catch (error) {
            toast.error('Bulk action failed');
        }
    };

    const handleStatusToggle = async (id) => {
        try {
            const res = await fetch(`/gallery/${id}/toggle`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content }
            });
            if (res.ok) {
                const data = await res.json();
                setList(list.map(g => g.id === id ? { ...g, status: data.status } : g));
                toast.success('Status updated');
            }
        } catch (error) {
            toast.error('Status update failed');
        }
    };

    const handleSelectRow = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleReset = () => {
        setSearch('');
        setSearchQuery('');
        setSort('');
        setStatusFilter('');
        setCurrentPage(1);
        setSelectedIds([]);
    };

    const handleBackFromForm = (updatedGallery) => {
        if (updatedGallery) {
            const exists = list.find(g => g.id === updatedGallery.id);
            if (exists) {
                setList(list.map(g => g.id === updatedGallery.id ? updatedGallery : g));
            } else {
                setList([updatedGallery, ...list]);
            }
        }
        setAddingGallery(false);
        setEditingGallery(null);
    };

    if (addingGallery) return <GalleryForm gallery={null} onBack={handleBackFromForm} />;
    if (editingGallery) return <GalleryForm gallery={editingGallery} onBack={handleBackFromForm} />;

    return (
        <div className="card shadow-sm p-4">
            <Toaster position="top-right" />
            <h2 className="mb-4">Gallery Management</h2>

            <div className="row mb-4">
                <div className="col-md-4 position-relative">
                    <label className="form-label fw-bold small">Advance Search</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Type to search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isSearching && (
                        <div className="spinner-border spinner-border-sm position-absolute" 
                             style={{ right: '20px', top: '38px' }}></div>
                    )}
                    {suggestions.length > 0 && (
                        <ul className="list-group position-absolute w-100 shadow-lg" style={{ zIndex: 1000, top: '70px' }}>
                            {suggestions.map((item) => (
                                <li 
                                    key={item.id} 
                                    className="list-group-item list-group-item-action d-flex align-items-center"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        setSearch(item.title);
                                        setSearchQuery(item.title);
                                        setSuggestions([]);
                                    }}
                                >
                                    {item.images && item.images[0] && (
                                        <img src={`/storage/${item.images[0]}`} width="30" height="30" className="me-2 rounded" />
                                    )}
                                    <span className="small fw-bold">{item.title}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="d-flex flex-wrap align-items-center mb-3 gap-2">
                <button className="btn btn-primary" onClick={() => setAddingGallery(true)}>+ Add Gallery</button>
                {selectedIds.length > 0 && (
                    <button className="btn btn-danger" onClick={handleBulkDelete}>Delete Selected ({selectedIds.length})</button>
                )}

                <input
                    type="text"
                    placeholder="Filter by title..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="form-control"
                    style={{ maxWidth: '200px' }}
                />

                <select value={sort} onChange={e => setSort(e.target.value)} className="form-select" style={{ maxWidth: '150px' }}>
                    <option value="">Sort By</option>
                    <option value="asc">Title A → Z</option>
                    <option value="desc">Title Z → A</option>
                </select>

                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-select" style={{ maxWidth: '150px' }}>
                    <option value="">All Status</option>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                </select>

                <button className="btn btn-outline-secondary" onClick={handleReset}>Reset</button>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered align-middle">
                    <thead className="table-dark text-center">
                        <tr>
                            <th>
                                <input 
                                    type="checkbox" 
                                    onChange={e => setSelectedIds(e.target.checked ? paginatedData.map(g => g.id) : [])}
                                    checked={selectedIds.length > 0 && paginatedData.every(g => selectedIds.includes(g.id))}
                                />
                            </th>
                            <th>Id</th>
                            <th>Title</th>
                            <th>Images</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? paginatedData.map(g => (
                            <tr key={g.id} className="text-center">
                                <td>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.includes(g.id)} 
                                        onChange={() => handleSelectRow(g.id)}
                                    />
                                </td>
                                <td>{g.id}</td>
                                <td className="text-start">{g.title}</td>
                                <td>
                                    <div className="d-flex justify-content-center flex-wrap gap-1">
                                        {g.images?.map((img, i) => (
                                            <img 
                                                key={i} 
                                                src={`/storage/${img}`} 
                                                width="40" 
                                                height="40" 
                                                className="rounded border pointer shadow-sm object-fit-cover"
                                                style={{ cursor: 'zoom-in' }}
                                                onClick={() => setLightboxImg(`/storage/${img}`)}
                                            />
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <div className="form-check form-switch d-flex justify-content-center">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            checked={parseInt(g.status) === 1} 
                                            onChange={() => handleStatusToggle(g.id)}
                                        />
                                    </div>
                                </td>
                                <td>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => setEditingGallery(g)}>Edit</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(g.id)}>Delete</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="text-center py-4">No records found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
                <button className="btn btn-outline-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>← Previous</button>
                <span className="fw-bold text-muted">Page {currentPage} of {totalPages || 1}</span>
                <button className="btn btn-outline-secondary" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)}>Next →</button>
            </div>

            {lightboxImg && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-75" 
                    style={{ zIndex: 9999, cursor: 'zoom-out' }} 
                    onClick={() => setLightboxImg(null)}
                >
                    <img src={lightboxImg} className="mw-100 mh-100 rounded shadow-lg border border-3 border-white" />
                </div>
            )}
        </div>
    );
}

createRoot(document.getElementById('app')).render(
    <GalleryIndex galleries={window.galleriesData || []} />
);