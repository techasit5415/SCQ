<script>
    import { createEventDispatcher, onMount, onDestroy } from 'svelte';
    import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
    export let restaurant;
    export let index = 0;
    export let isPromoted = false;
    
    const dispatch = createEventDispatcher();
    
    // State for image loading
    let imageLoaded = false;
    let imageError = false;
    let loadingTimeout;
    
    onMount(() => {
        // Test image loading with a new Image object first
        if (restaurantImage && restaurantImage !== '/restaurant-placeholder.svg') {
            // console.log('🧪 Testing image load:', restaurantImage);
            
            const testImg = new Image();
            testImg.onload = () => {
                // console.log('✅ Pre-test image loaded successfully:', restaurantImage);
                imageLoaded = true;
                imageError = false;
                // Clear any existing timeout
                if (loadingTimeout) {
                    clearTimeout(loadingTimeout);
                }
            };
            
            testImg.onerror = () => {
                // console.log('❌ Pre-test image failed:', restaurantImage);
                imageError = true;
                imageLoaded = false;
            };
            
            // Set a timeout as backup
            loadingTimeout = setTimeout(() => {
                if (!imageLoaded) {
                    // console.log('⏰ Image loading timeout for:', restaurantImage);
                    imageError = true;
                }
            }, 10000); // 10 seconds timeout
            
            // Start the test
            testImg.src = restaurantImage;
        }
    });
    
    onDestroy(() => {
        if (loadingTimeout) {
            clearTimeout(loadingTimeout);
        }
    });
    
    // Set timeout for image loading
    $: if (restaurantImage && !imageLoaded && !imageError) {
        // Clear existing timeout
        if (loadingTimeout) {
            clearTimeout(loadingTimeout);
        }
        
        // Set timeout to show placeholder after 3 seconds
        loadingTimeout = setTimeout(() => {
            if (!imageLoaded) {
                console.log('⏰ Image loading timeout for:', restaurantImage);
                imageError = true;
            }
        }, 3000);
    }
    
    // Calculate rating display
    $: rating = restaurant.rating ?? 0;
    $: reviewCount = restaurant.review_count ?? 0;
    // $: deliveryTime = restaurant.delivery_time || '15-30';
    // ใช้จำนวนคิวจริงจาก restaurant.queueCount (ถ้ามี) หรือ 0
    $: QueueM = restaurant.queueCount ?? 0;
    
    // เช็คสถานะเปิด-ปิดร้าน (ใช้ field is_open จาก Shop collection)
    $: isOpen = restaurant.is_open ?? true;
    
    // Debug queue count
    $: if (restaurant.Name || restaurant.name) {
        const shopName = restaurant.Name || restaurant.name;
        console.log(`🏪 ${shopName}: queueCount = ${restaurant.queueCount}, QueueM = ${QueueM}, isOpen = ${isOpen}`);
    }
    
    // Get restaurant image with proper URL handling
    $: restaurantImage = getRestaurantImage(restaurant);
    
    // Debug log
    $: if (restaurant) {
        // console.log('🏪 Restaurant data:', restaurant.name);
        // console.log('🖼️ Generated image URL:', restaurantImage);
        // console.log('📊 Image states - loaded:', imageLoaded, 'error:', imageError);
        // console.log('🔧 PUBLIC_POCKETBASE_URL:', PUBLIC_POCKETBASE_URL);
    }
    
    function getRestaurantImage(restaurant) {
        const pbUrl = PUBLIC_POCKETBASE_URL;
        
        // console.log('🔍 Looking for image in restaurant:', restaurant);
        // console.log('🌐 Raw PUBLIC_POCKETBASE_URL:', PUBLIC_POCKETBASE_URL);
        // console.log('🌐 Using PocketBase URL:', pbUrl);
        // console.log('🌐 URL type:', typeof pbUrl);
        // console.log('🌐 URL length:', pbUrl?.length);
        
        // // Force use hardcoded URL for debugging
        // const debugUrl = 'http://10.1.1.113:8080';
        // console.log('🐛 Debug URL:', debugUrl);
        
        // Check if restaurant has any image field with filename
        const imageFields = ['image', 'photo', 'picture', 'img', 'field'];
        
        for (const fieldName of imageFields) {
            const imageFile = restaurant[fieldName];
            // console.log(`Checking field '${fieldName}':`, imageFile, 'Type:', typeof imageFile, 'Length:', imageFile?.length);
            
            if (imageFile && typeof imageFile === 'string' && imageFile.trim() !== '') {
                // Use COLLECTION NAME not collection ID
                const imageUrl = `${pbUrl}/api/files/${restaurant.collectionName}/${restaurant.id}/${imageFile}`;
                // console.log('🎯 Using CORRECTED image URL:', imageUrl);
                return imageUrl;
            }
        }
        
        // Try to find any field that looks like an image filename
        console.log('🔍 Scanning all restaurant fields for images...');
        for (const [key, value] of Object.entries(restaurant)) {
            console.log(`Field '${key}':`, value, 'Type:', typeof value);
            
            if (typeof value === 'string' && value.trim() !== '' &&
                (value.endsWith('.jpg') || value.endsWith('.jpeg') || 
                 value.endsWith('.png') || value.endsWith('.gif') || 
                 value.endsWith('.webp') || value.endsWith('.svg'))) {
                // console.log(`🎯 Found image file in field '${key}':`, value);
                
                // Try multiple URL patterns - REMOVE thumbnail for now
                const baseUrl = `${PUBLIC_POCKETBASE_URL}/api/files/${restaurant.collectionId}/${restaurant.id}/${value}`;
                
                // console.log('📸 Base URL:', baseUrl);
                
                // Return base URL without thumbnail
                return baseUrl;
            }
        }
        
        // console.log('❌ No image found, using placeholder');
        return '/restaurant-placeholder.svg';
    }
    
    function handleImageLoad() {
        // console.log('✅ Image loaded successfully:', restaurantImage);
        imageLoaded = true;
        imageError = false;
        // Clear timeout when image loads successfully
        if (loadingTimeout) {
            clearTimeout(loadingTimeout);
        }
    }
    
    function handleImageError(event) {
        // console.log('❌ Image failed to load:', restaurantImage);
        // console.log('❌ Error event:', event);
        // console.log('❌ Error target:', event.target);
        // console.log('❌ Restaurant name:', restaurant.name);
        
        // Try alternative image URL patterns
        if (restaurantImage && !restaurantImage.includes('?')) {
            console.log('🔄 Trying with query parameter...');
            const altUrl = restaurantImage + '?t=' + Date.now();
            event.target.src = altUrl;
            return;
        }
        
        imageError = true;
        imageLoaded = false;
        // Clear timeout when image fails
        if (loadingTimeout) {
            clearTimeout(loadingTimeout);
        }
    }
    
    function handleRestaurantClick() {
        dispatch('select', {
            restaurant,
            index
        });
    }
    
    function handleKeyPress(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleRestaurantClick();
        }
    }
</script>

<div class="restaurant-card" class:promoted={isPromoted} class:closed={!isOpen} role="button" tabindex="0" on:click={handleRestaurantClick} on:keypress={handleKeyPress}>
    {#if isPromoted}
        <div class="promoted-badge">
            <span class="badge-icon">⭐</span>
            <span class="badge-text">แนะนำ</span>
        </div>
    {/if}
    
    {#if !isOpen}
        <div class="closed-badge">
            <span class="closed-icon">🔒</span>
            <span class="closed-text">ปิดทำการ</span>
        </div>
    {/if}
    
    <div class="restaurant-image" class:grayscale={!isOpen}>
        <div class="image-container">
            <!-- Always show placeholder first -->
            <div class="placeholder-image" class:hidden={imageLoaded}>
                <div class="placeholder-icon">🍽️</div>
                <div class="placeholder-text">{imageError ? 'ไม่มีรูปภาพ' : 'กำลังโหลด...'}</div>
            </div>
            
            <!-- Show loading spinner when loading -->
            {#if !imageLoaded && !imageError}
                <div class="image-loading">
                    <div class="loading-spinner"></div>
                </div>
            {/if}
            
            <!-- Image element - with better error handling -->
            <img 
                src={restaurantImage} 
                alt={restaurant.Name || restaurant.name || 'ร้านอาหาร'} 
                on:load={handleImageLoad}
                on:error={handleImageError}
                class:loaded={imageLoaded}
                style="display: {imageLoaded ? 'block' : 'none'}"
                crossorigin="anonymous"
                referrerpolicy="no-referrer"
            />
        </div>
        
        <!-- <div class="delivery-badge">
            {deliveryTime} นาที
        </div> -->
    </div>
    
    <div class="restaurant-info">
        <div class="restaurant-header">
            <h3 class="restaurant-name">{restaurant.Name || restaurant.name || 'ไม่ระบุชื่อ'}</h3>
            <div class="restaurant-type">{restaurant.Type_Shop || 'อาหารทั่วไป'}</div>
        </div>
        
        <div class="restaurant-details">
            <div class="rating">
                {#if reviewCount > 0}
                    <span class="star">⭐</span>
                    <span class="rating-text">{rating.toFixed(1)} ({reviewCount})</span>
                {:else}
                    <span class="rating-text no-reviews">ยังไม่มีรีวิว</span>
                {/if}
                <span class="category">{restaurant.Type_Shop || ''}</span>
            </div>
            
            <div class="Queue">
                <span class="Queue">{QueueM} Queue</span>
            </div>
        </div>
        
        {#if restaurant.Details}
            <p class="restaurant-description">{restaurant.Details}</p>
        {/if}
        
        {#if restaurant.Addr}
            <p class="restaurant-address">{restaurant.Addr}</p>
        {/if}
    </div>
</div>

<style>
    .restaurant-card {
        position: relative;
        display: flex;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 16px;
        min-height: 140px;
    }
    
    .restaurant-card.promoted {
        border: 2px solid #fbbf24;
        background: linear-gradient(to right, #fffbeb 0%, white 100%);
    }
    
    .restaurant-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
    
    .promoted-badge {
        position: absolute;
        top: 10px;
        left: 10px;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: white;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 2px 8px rgba(251, 191, 36, 0.5);
        z-index: 100;
        animation: pulse 2s ease-in-out infinite;
        white-space: nowrap;
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.05);
            opacity: 0.9;
        }
    }
    
    .badge-icon {
        font-size: 12px;
    }
    
    .badge-text {
        font-size: 11px;
        letter-spacing: 0.5px;
    }
    
    .closed-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        z-index: 100;
        white-space: nowrap;
    }
    
    .closed-icon {
        font-size: 12px;
    }
    
    .closed-text {
        font-size: 11px;
        letter-spacing: 0.5px;
    }
    
    .restaurant-card.closed {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .restaurant-card.closed:hover {
        transform: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .restaurant-image {
        position: relative;
        width: 140px;
        min-height: 100%;
        flex-shrink: 0;
        overflow: hidden;
        border-radius: 12px 0 0 12px;
        background: #f5f5f5;
        transition: filter 0.3s ease;
    }
    
    .restaurant-image.grayscale {
        filter: grayscale(100%);
    }
    
    .image-container {
        position: relative;
        width: 100%;
        height: 100%;
    }
    
    .restaurant-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        transition: opacity 0.3s ease;
        opacity: 0;
        display: block;
    }
    
    .restaurant-image img.loaded {
        opacity: 1;
    }
    
    .placeholder-image {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #f0f0f0;
        color: #999;
        transition: opacity 0.3s ease;
    }
    
    .placeholder-image.hidden {
        opacity: 0;
        pointer-events: none;
    }
    
    .placeholder-icon {
        font-size: 32px;
        margin-bottom: 8px;
    }
    
    .placeholder-text {
        font-size: 10px;
        font-weight: 500;
    }
    
    .image-loading {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
    }
    
    .loading-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid #e0e0e0;
        border-top: 2px solid #ff8c00;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    /* .delivery-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(255, 140, 0, 0.9);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 600;
    } */
    
    .restaurant-info {
        flex: 1;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .restaurant-header {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .restaurant-name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0;
        line-height: 1.2;
    }
    
    .restaurant-type {
        background: #f0f0f0;
        color: #666;
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 8px;
        align-self: flex-start;
        font-weight: 500;
    }
    
    .restaurant-details {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 4px;
    }
    
    .rating {
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .star {
        font-size: 14px;
    }
    
    .rating-text {
        font-size: 12px;
        color: #666;
        font-weight: 500;
    }
    
    .rating-text.no-reviews {
        color: #999;
        font-style: italic;
    }
    
    .category {
        font-size: 11px;
        color: #999;
    }
    
    .Queue {
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .Queue {
        background: #ff8c00;
        color: white;
        padding: 4px 8px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
    }
    
    .restaurant-description {
        font-size: 12px;
        color: #666;
        margin: 0;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .restaurant-address {
        font-size: 11px;
        color: #999;
        margin: 0;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    /* Mobile responsive */
    @media (max-width: 480px) {
        .restaurant-card {
            margin-bottom: 12px;
        }
        
        .restaurant-image {
            width: 100px;
            height: 100px;
        }
        
        .placeholder-icon {
            font-size: 24px;
            margin-bottom: 6px;
        }
        
        .placeholder-text {
            font-size: 9px;
        }
        
        .loading-spinner {
            width: 20px;
            height: 20px;
        }
        
        .restaurant-info {
            padding: 12px;
            gap: 6px;
        }
        
        .restaurant-name {
            font-size: 14px;
        }
        
        .restaurant-type {
            font-size: 10px;
        }
        
        .rating-text {
            font-size: 11px;
        }
        
        /* .delivery-fee {
            font-size: 10px;
            padding: 3px 6px;
        } */
        
        .restaurant-description {
            font-size: 11px;
        }
        
        .restaurant-address {
            font-size: 10px;
        }
    }
</style>