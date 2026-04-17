import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * GalleryForm Component
 * Handles CREATE and EDIT
 */
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

        const res = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });

        const updatedGallery = await res.json();
        onBack(updatedGallery);
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
                        <div key={index} className="d-flex align-items-center mb-2">
                            <input
                                type="file"
                                name="images[]"
                                className="form-control"
                                onChange={(e) => handleNewFileChange(e, index)}
                            />
                            {imgObj.type === 'existing' && (
                                <img src={`/storage/${imgObj.value}`} width="50" className="ms-2 rounded" />
                            )}
                            <button type="button" className="btn btn-danger ms-2" onClick={() => removeImage(index)}>Remove</button>
                            {imgObj.type === 'existing' && (
                                <input type="hidden" name="existing_images[]" value={imgObj.value} />
                            )}
                        </div>
                    ))}
                    <button type="button" className="btn btn-secondary" onClick={addImage}>+ Add Image</button>
                </div>

                <div className="mb-3">
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

                <button type="submit" className="btn btn-primary">{gallery ? 'Update' : 'Save'}</button>
            </form>
        </div>
    );
}

/**
 * GalleryIndex Component
 * Handles list, search, filter, sort, pagination, add, edit, delete
 */
function GalleryIndex({ galleries }) {
    const [list, setList] = useState(galleries);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [editingGallery, setEditingGallery] = useState(null);
    const [addingGallery, setAddingGallery] = useState(false);
    const perPage = 4;

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

    const handleDelete = id => {
        if (!confirm('Are you sure to delete?')) return;
        setList(list.filter(g => g.id !== id));
        fetch(`/gallery/${id}/delete`, {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content }
        });
    };

    const handleReset = () => {
        setSearch('');
        setSort('');
        setStatusFilter('');
        setCurrentPage(1);
    };

    const handleBackFromForm = (updatedGallery) => {
        if (updatedGallery) {
            setList(list.map(g => g.id === updatedGallery.id ? updatedGallery : g));
        }
        setAddingGallery(false);
        setEditingGallery(null);
    };

    if (addingGallery) return <GalleryForm gallery={null} onBack={handleBackFromForm} />;
    if (editingGallery) return <GalleryForm gallery={editingGallery} onBack={handleBackFromForm} />;

    return (
        <div className="card shadow-sm p-4">
            <h2 className="mb-4">Gallery List</h2>

            <div className="d-flex flex-wrap align-items-center mb-3 gap-2">
                <button className="btn btn-primary" onClick={() => setAddingGallery(true)}>+ Add Gallery</button>

                <input
                    type="text"
                    placeholder="Search by title..."
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

            <div className="mb-3">
                Total Galleries: <span className="badge bg-primary">{filteredList.length}</span>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Id</th>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Images</th>
                            <th>Status</th>
                            <th width="160">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? paginatedData.map(g => (
                            <tr key={g.id}>
                                <td>{g.id}</td>
                                <td>{g.title}</td>
                                <td>{g.description}</td>
                                <td>
                                    {g.images?.map((img, i) => (
                                        <img key={i} src={`/storage/${img}`} width="40" className="me-1 rounded" />
                                    ))}
                                </td>
                                <td>
                                    <span className={`badge ${g.status ? 'bg-success' : 'bg-secondary'}`}>
                                        {g.status ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => setEditingGallery(g)}>Edit</button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this gallery?')) {
                                                handleDelete(g.id);
                                            }
                                        }}
                                    >
                                        Delete
                                    </button>                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="text-center">No records found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
                <button className="btn btn-outline-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>← Previous</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button className="btn btn-outline-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next →</button>
            </div>
        </div>
    );
}

// Render App
createRoot(document.getElementById('app')).render(
    <GalleryIndex galleries={window.galleriesData} />
);