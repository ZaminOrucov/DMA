const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

// Menyu panelini açmaq və ya bağlamaq (Mobil və Desktop üçün)
menuToggle.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('mobile-open');
    } else {
        sidebar.classList.toggle('collapsed');
    }
});

// Əsas menyuların alt başlıqlarını açmaq / bağlamaq
function toggleSubmenu(element) {
    const parentLi = element.parentElement;
    parentLi.classList.toggle('active');
}

// Menyu elementlərinə kliklədikdə sağ tərəfdəki məzmunu dinamik dəyişmək
function showContent(sectionId) {
    // 1. Bütün bölmələrdən 'active' klassını silirik (gizlədirik)
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // 2. Yalnız seçilən bölməyə 'active' klassı veririk (göstəririk)
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Mobil menyu açıqdısa bağlayırıq
    if (window.innerWidth <= 768 && typeof sidebar !== 'undefined') {
        sidebar.classList.remove('mobile-open');
    }
}
// Səhifə tam yüklənəndə yalnız "esas-sehife"ni aç, digərlərini gizlət
document.addEventListener("DOMContentLoaded", function () {
    showContent('esas-sehife');
});
/**
 * Əsas səhifədə rəhbər tərəfindən yeni qeyd əlavə etmək üçün funksiya
 */
function addNewNote() {
    const titleInput = document.getElementById('noteTitleInput');
    const descInput = document.getElementById('noteDescInput');
    const notesContainer = document.getElementById('notesContainer');

    const title = titleInput.value.trim();
    const desc = descInput.value.trim();

    if (!title || !desc) {
        alert("Zəhmət olmasa qeydin başlığını və mətnini daxil edin!");
        return;
    }

    // Cari tarixi almaq üçün
    const today = new Date();
    const dateStr = String(today.getDate()).padStart(2, '0') + '.' +
        String(today.getMonth() + 1).padStart(2, '0') + '.' +
        today.getFullYear();

    // Yeni qeyd elementi yaradılması
    const noteCard = document.createElement('div');
    noteCard.className = 'note-card';
    noteCard.innerHTML = `
        <div class="note-card-header">
            <h4>${escapeHtml(title)}</h4>
            <span class="note-date">${dateStr}</span>
        </div>
        <p>${escapeHtml(desc)}</p>
        <button class="btn-delete-note" onclick="this.parentElement.remove()"><i class="fa-solid fa-trash"></i></button>
    `;

    // Siyahının əvvəlinə əlavə edirik
    notesContainer.prepend(noteCard);

    // Formu təmizləyirik
    titleInput.value = '';
    descInput.value = '';
}

// Təhlükəsizlik üçün HTML simvollarını qorumaq köməkçisi
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}
/**
 * TAB SEÇİMİ VƏ FİLTRLƏMƏ FUNKSİYASI
 * 
 * @param {HTMLElement} element - Kliklənən statistik kart
 * @param {string} tabType - Seçilən kateqoriya ('all', 'hoii', 'yarmarka', 'ebm')
 */
function selectEmpTab(element, tabType) {
    // 1. Bütün tab kartlarından active-tab klassını silirik
    const allTabs = document.querySelectorAll('.emp-card');
    allTabs.forEach(tab => tab.classList.remove('active-tab'));

    // 2. Kliklənən karta active-tab klassını veririk
    element.classList.add('active-tab');

    console.log(`[TAB DƏYİŞDİ]: Seçilən rejim -> ${tabType}`);

    // 3. Backend-dən yeni datanı çəkmək üçün funksiyanı çağırırıq
    fetchEmploymentData(tabType);
}

/**
 * BACKEND API İLƏ MƏLUMATLARIN İDARƏ EDİLMƏSİ (SQL INTERACTION)
 * 
 * [NOT FOR BACKEND]: Bu funksiya həm il/ay/rayon filtrləri dəyişdikdə, həm də ust tablar klikləndikdə çağırılır.
 */
function fetchEmploymentData(currentTab) {
    // Əgər parametr ötürülməyibsə, aktiv olan tab-ı tapırıq
    if (!currentTab) {
        const activeCard = document.querySelector('.emp-card.active-tab');
        currentTab = activeCard ? activeCard.getAttribute('data-tab') : 'all';
    }

    const year = document.getElementById('empYearFilter').value;
    const month = document.getElementById('empMonthFilter').value;
    const region = document.getElementById('empRegionFilter').value;

    console.log(`[BACKEND API SORĞUSU] -> Tab: ${currentTab}, İl: ${year}, Ay: ${month}, Rayon: ${region}`);

    /*
    // NÜMUNƏ BACKEND FETCH / AJAX SORĞUSU (C#, PHP, Node.js və s. üçün):
    fetch(`/api/employment/stats?type=${currentTab}&year=${year}&month=${month}&region=${region}`)
        .then(response => response.json())
        .then(data => {
            // SQL-dən gələn datalara uyğun qrafikləri dinamik yeniləyirik
            updateEmploymentCharts(data);
        })
        .catch(err => console.error("Data yüklənərkən xəta yarandı:", err));
    */
}

/**
 * SQL / API-dən gələn məlumatlarla DOM-un yenilənməsi üçün nümunə funksiya
 */
function updateEmploymentCharts(data) {
    // Nümunə: Naxçıvan üzrə qeydiyyat ünvanı sayını və Dövlət/Özəl bölgüsünü yeniləmək
    /*
    const naxcivanGroup = document.querySelector('#regAddressBarChart .single-bar-group[data-region="Naxçıvan"]');
    if (naxcivanGroup && data.regAddress.naxcivan) {
        naxcivanGroup.querySelector('.bar-val').innerText = data.regAddress.naxcivan.total;
        naxcivanGroup.setAttribute('data-dovlet', data.regAddress.naxcivan.dovlet);
        naxcivanGroup.setAttribute('data-ozel', data.regAddress.naxcivan.ozel);
        naxcivanGroup.querySelector('.bar-hover-popover span:nth-child(1)').innerText = data.regAddress.naxcivan.dovlet;
        naxcivanGroup.querySelector('.bar-hover-popover span:nth-child(2)').innerText = data.regAddress.naxcivan.ozel;
    }
    */
}
/**
 * PEŞƏ HAZIRLIĞI KURSLARI BÖLMƏSİ ÜÇÜN FİLTRLƏMƏ FUNKSİYASI
 * 
 * [NOT FOR BACKEND]: Rayon, Dövr və Peşə seçildikdə SQL-dən məlumat çəkmək üçün çağırılır.
 */
function fetchPeseData() {
    const region = document.getElementById('peseRegionFilter').value;
    const period = document.getElementById('pesePeriodFilter').value;
    const profession = document.getElementById('peseProfessionFilter').value;

    console.log(`[BACKEND API SORĞUSU - PEŞƏ KURSLARI] -> Rayon: ${region}, Dövr: ${period}, Peşə: ${profession}`);

    /*
    // BACKEND API AJAX / FETCH İNTEQRASİYASI NÜMUNƏSİ:
    fetch(`/api/pese-kurslari/stats?region=${region}&period=${period}&profession=${profession}`)
        .then(response => response.json())
        .then(data => {
            // SQL-dən gələn datalara uyğun dəyərləri ekranda yeniləyirik:
            document.getElementById('val-kurs-sayi').innerText = data.courseCount;
            document.getElementById('val-celb-olunan').innerText = data.enrolledCount;
            document.getElementById('val-bitiren').innerText = data.completedCount;
            document.getElementById('val-davam-eden').innerText = data.ongoingCount;
            document.getElementById('val-xaric-olunan').innerText = data.droppedCount;

            // Gender və Rayon üzrə qrafikləri yeniləmək üçün:
            // updatePeseCharts(data);
        })
        .catch(err => console.error("Peşə kursları məlumatı yüklənərkən xəta yarandı:", err));
    */
}
/**
 * VAKANSİYA BANKI BÖLMƏSİ ÜÇÜN FİLTRLƏMƏ FUNKSİYASI
 * 
 * [NOT FOR BACKEND]: İl, Ay və Rayon seçildikdə SQL-dən məlumat çəkmək üçün çağırılır.
 */
function fetchVacancyData() {
    const year = document.getElementById('vacYearFilter').value;
    const month = document.getElementById('vacMonthFilter').value;
    const region = document.getElementById('vacRegionFilter').value;

    console.log(`[BACKEND API SORĞUSU - VAKANSİYA BANKI] -> İl: ${year}, Ay: ${month}, Rayon: ${region}`);

    /*
    // BACKEND API AJAX / FETCH İNTEQRASİYASI NÜMUNƏSİ:
    fetch(`/api/vacancies/stats?year=${year}&month=${month}&region=${region}`)
        .then(response => response.json())
        .then(data => {
            // SQL-dən gələn dataya uyğun göstəriciləri yeniləyirik:
            document.getElementById('val-total-vac').innerText = data.totalVacancies;
            
            // Mülkiyyət növü
            document.getElementById('val-dovlet-txt').innerText = data.propertyType.dovlet;
            document.getElementById('lbl-dovlet').innerText = data.propertyType.dovlet;
            document.getElementById('val-qeyridovlet-txt').innerText = data.propertyType.qeyriDovlet;
            document.getElementById('lbl-qeyridovlet').innerText = data.propertyType.qeyriDovlet;

            // Qulluqçu / Fəhlə
            document.getElementById('val-qulluqcu-txt').innerText = data.category.qulluqcu;
            document.getElementById('lbl-qulluqcu').innerText = data.category.qulluqcu;
            document.getElementById('val-fehle-txt').innerText = data.category.fehle;
            document.getElementById('lbl-fehle').innerText = data.category.fehle;

            // Sütunlu qrafikləri yeniləmək üçün:
            // updateVacancyAddressChart(data.addressStats);
        })
        .catch(err => console.error("Vakansiya məlumatı yüklənərkən xəta yarandı:", err));
    */
}
/**
 * İŞSİZLİKDƏN SIĞORTA BÖLMƏSİ ÜÇÜN FİLTRLƏMƏ FUNKSİYASI
 * 
 * [NOT FOR BACKEND]: Rayon, Dövr və Status seçildikdə SQL-dən məlumat çəkmək üçün çağırılır.
 */
function fetchSigortaData() {
    const region = document.getElementById('sigRegionFilter').value;
    const period = document.getElementById('sigPeriodFilter').value;
    const status = document.getElementById('sigStatusFilter').value;

    console.log(`[BACKEND API SORĞUSU - İŞSİZLİKDƏN SIĞORTA] -> Rayon: ${region}, Dövr: ${period}, Status: ${status}`);

    /*
    // BACKEND API AJAX / FETCH İNTEQRASİYASI NÜMUNƏSİ:
    fetch(`/api/insurance/stats?region=${region}&period=${period}&status=${status}`)
        .then(response => response.json())
        .then(data => {
            // SQL-dən gələn datalara uyğun göstəriciləri yeniləyirik:
            document.getElementById('val-sig-muraciet').innerText = data.totalApplications;
            document.getElementById('val-sig-baxilan').innerText = data.reviewedCount;
            document.getElementById('val-sig-imtina').innerText = data.rejectedCount;
            document.getElementById('val-sig-teyinat').innerText = data.approvedCount;
            document.getElementById('val-sig-dayandirilan').innerText = data.suspendedCount;
            document.getElementById('val-sig-aktiv').innerText = data.activePaymentCount;

            // Gender faizlərini yeniləmək üçün:
            document.getElementById('val-sig-kisi-txt').innerText = data.gender.malePercent + '%';
            document.getElementById('val-sig-qadin-txt').innerText = data.gender.femalePercent + '%';

            // Rayonlar üzrə qrafiki yeniləmək üçün:
            // updateSigortaRegionChart(data.regionStats);
        })
        .catch(err => console.error("Sığorta məlumatı yüklənərkən xəta yarandı:", err));
    */
}
/**
 * PEŞƏYÖNÜMLÜ MƏSLƏHƏT XİDMƏTİ BÖLMƏSİ ÜÇÜN FİLTRLƏMƏ FUNKSİYASI
 * 
 * [NOT FOR BACKEND]: İl və Ay seçildikdə SQL-dən məlumat çəkmək üçün çağırılır.
 */
function fetchOrientationData() {
    const year = document.getElementById('orientYearFilter').value;
    const month = document.getElementById('orientMonthFilter').value;

    console.log(`[BACKEND API SORĞUSU - PEŞƏYÖNÜMLÜ MƏSLƏHƏT] -> İl: ${year}, Ay: ${month}`);

    /*
    // BACKEND API AJAX / FETCH İNTEQRASİYASI NÜMUNƏSİ:
    fetch(`/api/orientation/stats?year=${year}&month=${month}`)
        .then(response => response.json())
        .then(data => {
            // SQL-dən gələn datalara uyğun göstəriciləri yeniləyirik:
            document.getElementById('val-orient-total').innerText = data.totalParticipants;
            
            // Layihələrin saylarını yeniləmək üçün:
            document.getElementById('val-pese-naxcivan').innerText = data.projects.peseFestNaxcivan;
            document.getElementById('val-pese-ordubad').innerText = data.projects.peseFestOrdubad;
            document.getElementById('val-ixtisas-beledcisi').innerText = data.projects.ixtisasBeledcisi;
            document.getElementById('val-kendime-gel').innerText = data.projects.kendimeGel;

            // Rayonlar üzrə qrafiki yeniləmək üçün:
            // updateOrientationRegionChart(data.regionStats);
        })
        .catch(err => console.error("Peşəyönümlü məsləhət xidməti məlumatı yüklənərkən xəta yarandı:", err));
    */
}
/**
 * ƏMƏKHAQQININ BİRGƏ MALİYYƏLƏŞDİRİLMƏSİ BÖLMƏSİ ÜÇÜN FİLTRLƏMƏ FUNKSİYASI
 * 
 * [NOT FOR BACKEND]: Rayon, Dövr və Müəssisə seçildikdə SQL-dən məlumat çəkmək üçün çağırılır.
 */
function fetchMaliyeData() {
    const region = document.getElementById('malRegionFilter').value;
    const period = document.getElementById('malPeriodFilter').value;
    const company = document.getElementById('malCompanyFilter').value;

    console.log(`[BACKEND API SORĞUSU - BİRGƏ MALİYYƏLƏŞDİRMƏ] -> Rayon: ${region}, Dövr: ${period}, Müəssisə: ${company}`);

    /*
    // BACKEND API AJAX / FETCH İNTEQRASİYASI NÜMUNƏSİ:
    fetch(`/api/co-financing/stats?region=${region}&period=${period}&company=${company}`)
        .then(response => response.json())
        .then(data => {
            // SQL-dən gələn datalara uyğun göstəriciləri yeniləyirik:
            document.getElementById('val-mal-isletemin').innerText = data.employed;
            document.getElementById('val-mal-davam').innerText = data.ongoingPayment;
            document.getElementById('val-mal-dayanib').innerText = data.pausedPaymentWorking;
            document.getElementById('val-mal-cixan').innerText = data.leftWork;

            // Gender faiz və saylarını yeniləmək üçün:
            document.getElementById('val-mal-kisi-txt').innerText = data.gender.male;
            document.getElementById('lbl-mal-kisi').innerText = data.gender.male;
            document.getElementById('val-mal-qadin-txt').innerText = data.gender.female;
            document.getElementById('lbl-mal-qadin').innerText = data.gender.female;

            // Qrafikləri yeniləmək üçün:
            // updateMaliyeCharts(data);
        })
        .catch(err => console.error("Birgə maliyyələşdirmə məlumatı yüklənərkən xəta yarandı:", err));
    */
}
/**
 * ƏMƏK YARMARKASI BÖLMƏSİ ÜÇÜN FİLTRLƏMƏ FUNKSİYASI
 * 
 * [NOT FOR BACKEND]: Dövr və Yarmarka seçildikdə SQL-dən məlumat çəkmək üçün çağırılır.
 */
function fetchYarmarkaData() {
    const period = document.getElementById('yarPeriodFilter').value;
    const fair = document.getElementById('yarSelectFilter').value;

    console.log(`[BACKEND API SORĞUSU - ƏMƏK YARMARKASI] -> Dövr: ${period}, Yarmarka: ${fair}`);

    /*
    // BACKEND API AJAX / FETCH İNTEQRASİYASI NÜMUNƏSİ:
    fetch(`/api/job-fairs/stats?period=${period}&fair=${fair}`)
        .then(response => response.json())
        .then(data => {
            // SQL-dən gələn datalara uyğun üst kartları yeniləyirik:
            document.getElementById('val-yar-istirak').innerText = data.totalParticipants;
            document.getElementById('val-yar-muessise').innerText = data.totalCompanies;
            document.getElementById('val-yar-vakansiya').innerText = data.totalVacancies;
            document.getElementById('val-yar-temin').innerText = data.totalEmployed;

            // Qrafikləri yeniləmək üçün:
            // updateYarmarkaCharts(data);
        })
        .catch(err => console.error("Əmək yarmarkası məlumatı yüklənərkən xəta yarandı:", err));
    */
}
/**
 * HAQQI ÖDƏNİLƏN İCTİMAİ İŞLƏR BÖLMƏSİ ÜÇÜN FİLTRLƏMƏ FUNKSİYASI
 * 
 * [NOT FOR BACKEND]: İl, Ay və Rayon seçildikdə SQL-dən məlumat çəkmək üçün çağırılır.
 */
function fetchPublicWorksData() {
    const year = document.getElementById('pubYearFilter').value;
    const month = document.getElementById('pubMonthFilter').value;
    const region = document.getElementById('pubRegionFilter').value;

    console.log(`[BACKEND API SORĞUSU - İCTİMAİ İŞLƏR] -> İl: ${year}, Ay: ${month}, Rayon: ${region}`);

    /*
    // BACKEND API AJAX / FETCH İNTEQRASİYASI NÜMUNƏSİ:
    fetch(`/api/public-works/stats?year=${year}&month=${month}&region=${region}`)
        .then(response => response.json())
        .then(data => {
            // SQL-dən gələn datalara uyğun göstəriciləri yeniləyirik:
            document.getElementById('val-pub-kvota').innerText = data.quota;
            document.getElementById('val-pub-celb').innerText = data.totalEnrolled;
            document.getElementById('val-pub-aktiv').innerText = data.activeWorkers;
            document.getElementById('val-pub-xitam').innerText = data.terminated;
            document.getElementById('val-pub-vakant').innerText = data.vacantPlaces;

            // Xülasə siyahı və qrafikləri yeniləmək üçün:
            document.getElementById('sum-aktiv').innerText = data.activeWorkers;
            document.getElementById('sum-xitam').innerText = data.terminated;
            document.getElementById('sum-vakant').innerText = data.vacantPlaces;

            // Gender məlumatları:
            document.getElementById('lbl-pub-kisi').innerText = data.gender.male;
            document.getElementById('lbl-pub-qadin').innerText = data.gender.female;
        })
        .catch(err => console.error("İctimai işlər məlumatı yüklənərkən xəta yarandı:", err));
    */
}
/**
 * ÖZÜNÜMƏŞĞULLUQ PROQRAMI BÖLMƏSİ ÜÇÜN FİLTRLƏMƏ VƏ BACKEND / SQL İNTEQRASİYA FUNKSİYASI
 */
function loadOzunumesgulluqData() {
    const year = document.getElementById('ozunFilterYear').value;
    const month = document.getElementById('ozunFilterMonth').value;
    const region = document.getElementById('ozunFilterRegion').value;

    console.log(`[BACKEND API SORĞUSU - ÖZÜNÜMƏŞĞULLUQ] -> İl: ${year}, Ay: ${month}, Rayon: ${region}`);

    /*
    // BACKEND API FETCH İNTEQRASİYASI NÜMUNƏSİ:
    fetch(`/api/ozunumesgulluq/stats?year=${year}&month=${month}&region=${region}`)
        .then(response => response.json())
        .then(data => {
            // Üst statistik kartlardakı rəqəmləri SQL datalarına uyğun yeniləyirik:
            document.querySelector('.val-muraciet').innerText = data.totalApplications;
            document.querySelector('.val-kvota').innerText = data.quota;
            document.querySelector('.val-emlak').innerText = data.providedWithProperty;
            document.querySelector('.val-novbe').innerText = data.inQueueRegistry;
            document.querySelector('.val-kenar').innerText = data.excluded;

            // Cədvəli və qrafikləri yeniləmək üçün digər funksiyalar:
            // updateOzunumesgulluqTable(data.tableRows);
            // updateOzunumesgulluqCharts(data.charts);
        })
        .catch(err => console.error("Özünüməşğulluq məlumatları yüklənərkən xəta baş verdi:", err));
    */
}
/**
 * Multi-Select menyunu açır / bağlayır
 */
function toggleMultiSelect(elementId) {
    const container = document.getElementById(elementId);

    // Digər açıq olan menyuları bağlayırıq
    document.querySelectorAll('.custom-multiselect').forEach(el => {
        if (el.id !== elementId) el.classList.remove('open');
    });

    container.classList.toggle('open');
}

/**
 * Ekranın boş yerinə kliklədikdə dropdown-u bağlayır
 */
document.addEventListener('click', function (e) {
    if (!e.target.closest('.custom-multiselect')) {
        document.querySelectorAll('.custom-multiselect').forEach(el => el.classList.remove('open'));
    }
});

/**
 * Checkbox-lar seçildikdə mətni və başlığı yeniləyən funksiya
 */
function handleMultiSelectChange(elementId) {
    const container = document.getElementById(elementId);
    const checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
    const selectedTextSpan = container.querySelector('.selected-text');

    // Seçilmiş checkbox-ların adlarını (value) massivə toplayırıq
    const selectedValues = Array.from(checkedBoxes).map(cb => cb.value);

    // Başlıq mətni tənzimləməsi
    if (selectedValues.length === 0) {
        if (elementId === 'multiSelectYear') selectedTextSpan.innerText = 'İlləri seçin...';
        else if (elementId === 'multiSelectMonth') selectedTextSpan.innerText = 'Ayları seçin...';
        else if (elementId === 'multiSelectRegion') selectedTextSpan.innerText = 'Rayonları seçin...';
    } else if (selectedValues.length <= 2) {
        // Seçilmiş ay və ya rayon adlarını vergüllə göstəririk (Örnək: "Yanvar, Fevral")
        selectedTextSpan.innerText = selectedValues.join(', ');
    } else {
        selectedTextSpan.innerText = `${selectedValues.length} seçim edildi`;
    }

    // Backend üçün filtrləri toplayıb sorğu göndəririk
    fetchDashboardDataWithMultiFilters();
}

/**
 * BACKEND / SQL İLƏ İL, AY ADLARI VƏ RAYON ÇOXLUSAL SEÇİM SORĞUSU
 * 
 * [NOT FOR BACKEND]: Bu funksiya seçilmiş bütün İlləri, Ay adlarını və Rayonları Array (massiv) kimi toplayır.
 * SQL Nümunəsi: SELECT * FROM DashboardData WHERE Year IN ('2025', '2026') AND MonthName IN ('Yanvar', 'Fevral') AND Region IN ('Naxçıvan', 'Şərur')
 */
function fetchDashboardDataWithMultiFilters() {
    // 1. Seçilmiş İllər (Örnək: ["2025", "2026"])
    const selectedYears = Array.from(document.querySelectorAll('#multiSelectYear input[type="checkbox"]:checked')).map(cb => cb.value);

    // 2. Seçilmiş Ay Adları (Örnək: ["Yanvar", "Fevral", "Mart"])
    const selectedMonths = Array.from(document.querySelectorAll('#multiSelectMonth input[type="checkbox"]:checked')).map(cb => cb.value);

    // 3. Seçilmiş Rayonlar (Örnək: ["Naxçıvan", "Şərur"])
    const selectedRegions = Array.from(document.querySelectorAll('#multiSelectRegion input[type="checkbox"]:checked')).map(cb => cb.value);

    console.log("[BACKEND API SORĞUSU]:", {
        years: selectedYears,
        months: selectedMonths,  // Birbaşa ay adları kimi ötürülür
        regions: selectedRegions
    });

    /*
    // BACKEND API FETCH / AJAX İNTEQRASİYASI:
    fetch('/api/dashboard/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            years: selectedYears,
            months: selectedMonths, // Örnək: ["Yanvar", "Fevral"]
            regions: selectedRegions
        })
    })
    .then(response => response.json())
    .then(data => {
        // SQL-dən gələn dataya əsasən cədvəl və qrafikləri yeniləyirik
        console.log("Backend SQL Cavabı:", data);
    })
    .catch(err => console.error("API xətası:", err));
    */
}
/**
 * Combo Box pəncərəsini açır / bağlayır
 */
function toggleComboBox(containerId) {
    const container = document.getElementById(containerId);

    // Digər açıq pəncərələri bağlayırıq
    document.querySelectorAll('.excel-combobox').forEach(el => {
        if (el.id !== containerId) el.classList.remove('open');
    });

    container.classList.toggle('open');
}

/**
 * Pəncərədən kənara kliklədikdə pəncərəni bağlayır
 */
document.addEventListener('click', function (e) {
    if (!e.target.closest('.excel-combobox')) {
        document.querySelectorAll('.excel-combobox').forEach(el => el.classList.remove('open'));
    }
});

/**
 * Excel Məntiqi ilə Axtarış (Search Box)
 */
function filterComboItems(containerId, searchText) {
    const container = document.getElementById(containerId);
    const labels = container.querySelectorAll('.combo-options-list label:not(.select-all-label)');
    const term = searchText.toLowerCase().trim();

    labels.forEach(label => {
        const text = label.textContent.toLowerCase();
        if (text.includes(term)) {
            label.style.display = "flex";
        } else {
            label.style.display = "none";
        }
    });
}

/**
 * "(Hamsını seç)" Checkbox-u sıxıldıqda
 */
function toggleSelectAll(containerId, isChecked) {
    const container = document.getElementById(containerId);
    // Yalnız hazırda görünən (axtarışda çıxan) checkbox-ları seçirik
    const checkboxes = container.querySelectorAll('.combo-options-list label:not(.select-all-label) input[type="checkbox"]');

    checkboxes.forEach(cb => {
        if (cb.closest('label').style.display !== 'none') {
            cb.checked = isChecked;
        }
    });

    handleComboChange(containerId);
}

/**
 * Seçimlər dəyişdikdə başlığı tənzimləyir və API sorğusu göndərir
 */
function handleComboChange(containerId) {
    const container = document.getElementById(containerId);
    const allCheckboxes = container.querySelectorAll('.combo-options-list label:not(.select-all-label) input[type="checkbox"]');
    const checkedBoxes = container.querySelectorAll('.combo-options-list label:not(.select-all-label) input[type="checkbox"]:checked');
    const selectAllCb = container.querySelector('.select-all-cb');
    const selectedTextSpan = container.querySelector('.combo-selected-text');

    const selectedValues = Array.from(checkedBoxes).map(cb => cb.value);

    // Hamsını seç checkbox-unun vəziyyətini güncəlləyirik
    if (selectedValues.length === allCheckboxes.length && allCheckboxes.length > 0) {
        selectAllCb.checked = true;
        selectAllCb.indeterminate = false;
        selectedTextSpan.innerText = '(Hamsı)';
    } else if (selectedValues.length === 0) {
        selectAllCb.checked = false;
        selectAllCb.indeterminate = false;
        selectedTextSpan.innerText = '(Heç biri)';
    } else {
        selectAllCb.checked = false;
        selectAllCb.indeterminate = true; // Hissəvi seçildiyini göstərən çizgi
        if (selectedValues.length <= 2) {
            selectedTextSpan.innerText = selectedValues.join(', ');
        } else {
            selectedTextSpan.innerText = `(${selectedValues.length} dənə seçildi)`;
        }
    }

    // Backend üçün SQL sorğusunu tetikləyirik
    fetchExcelFilterData();
}

/**
 * BACKEND / SQL İLƏ ÇOXLUSAL EXCEL FİLTRİ SORĞUSU
 */
function fetchExcelFilterData() {
    const selectedYears = Array.from(document.querySelectorAll('#comboYear .combo-options-list input[type="checkbox"]:checked')).map(cb => cb.value);
    const selectedMonths = Array.from(document.querySelectorAll('#comboMonth .combo-options-list input[type="checkbox"]:checked')).map(cb => cb.value);
    const selectedRegions = Array.from(document.querySelectorAll('#comboRegion .combo-options-list input[type="checkbox"]:checked')).map(cb => cb.value);

    console.log("[EXCEL FİLTRİ BACKEND SORĞUSU]:", {
        years: selectedYears,    // Massiv: ["2025", "2026"]
        months: selectedMonths,  // Massiv: ["Yanvar", "Fevral"]
        regions: selectedRegions // Massiv: ["Naxçıvan", "Şərur"]
    });

    /*
    // BACKEND API AJAX / FETCH İNTEQRASİYASI:
    fetch('/api/reports/excel-filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            years: selectedYears,
            months: selectedMonths,
            regions: selectedRegions
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("SQL nəticələri:", data);
        // Qrafik və cədvəlləri dinamik yeniləyirik
    })
    .catch(err => console.error("Excel filter API xətası:", err));
    */
}
function addNewNoteWithDeadline() {
    const titleInput = document.getElementById('noteTitleInput');
    const descInput = document.getElementById('noteDescInput');
    const deadlineInput = document.getElementById('noteDeadlineInput');
    const container = document.getElementById('notesContainer');

    if (!titleInput.value.trim() || !descInput.value.trim()) {
        alert("Lütfən qeydin başlığını və məzmununu daxil edin.");
        return;
    }

    // Cari tarix
    const today = new Date();
    const currentDateStr = today.toLocaleDateString('az-AZ');

    // Dedlayn hesablanması
    let deadlineText = "Dedlayn təyin edilməyib";
    let badgeStyle = "background: #f1f1f1; color: #666;";

    if (deadlineInput.value) {
        const deadlineDate = new Date(deadlineInput.value);

        // Gün fərqinin hesablanması
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            deadlineText = `Qalan vaxt: ${diffDays} gün`;
            badgeStyle = "background: #e8f5e9; color: #2e7d32;"; // Yaşıl rəng
        } else if (diffDays === 0) {
            deadlineText = "Son gündür!";
            badgeStyle = "background: #fff3e0; color: #ef6c00;"; // Narıncı rəng
        } else {
            deadlineText = `Vaxtı bitib (${Math.abs(diffDays)} gün keçib)`;
            badgeStyle = "background: #ffebee; color: #c62828;"; // Qırmızı rəng
        }
    }

    // Yeni kartın HTML-i
    const noteHTML = `
        <div class="note-card" style="position: relative; border-left: 4px solid #2b5256; padding: 15px; margin-bottom: 15px; background: #fff; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div class="note-card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h4 style="margin: 0; color: #2b5256;">${titleInput.value}</h4>
                <span class="note-date" style="font-size: 12px; color: #777;">Tarix: ${currentDateStr}</span>
            </div>
            <p style="margin-bottom: 12px; color: #444;">${descInput.value}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="deadline-badge" style="${badgeStyle} padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                    <i class="fa-regular fa-clock"></i> ${deadlineText}
                </span>
                <button class="btn-delete-note" onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: #e74c3c; cursor: pointer;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `;

    // Siyahının əvvəlinə əlavə et
    container.insertAdjacentHTML('afterbegin', noteHTML);

    // Formu təmizlə
    titleInput.value = '';
    descInput.value = '';
    deadlineInput.value = '';
}
// Zəngə vuranda pəncərəni açır / bağlayır
function toggleNotificationDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
    } else {
        dropdown.style.display = 'block';
    }
}

// Qeydin başlığına vuranda Əsas səhifəyə keçir və menyunu aktiv edir
function goToMainPageFromNote(sectionId) {
    // 1. Dropdown pəncərəsini bağla
    document.getElementById('notificationDropdown').style.display = 'none';

    // 2. Bütün bölmələri gizlət və yalnız 'esas-sehife' bölməsini göstər
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(sec => sec.classList.remove('active'));

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // 3. Sol menyudakı 'Əsas səhifə' düyməsini aktiv göstər
    const menuItems = document.querySelectorAll('.sidebar-menu a, .submenu a');
    menuItems.forEach(item => item.classList.remove('active'));

    const mainPageMenuItem = document.querySelector(`[onclick*="${sectionId}"]`);
    if (mainPageMenuItem) {
        mainPageMenuItem.classList.add('active');
    }

    // 4. Səhifəni ən yuxarıya sürüşdür
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Ekranın istənilən boş yerinə vurulduqda bildiriş pəncərəsini bağla
window.addEventListener('click', function (event) {
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown && dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
    }
});
// Kartlara vurulduqda müvafiq menyu bölməsinə keçid funksiyası
function navigateToSection(targetSectionId) {
    // 1. Bütün bölmələrdən 'active' sinfini sil və seçilmiş bölməni aktiv et
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));

    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // 2. Sol menyudakı linklərdən 'active' sinfini sil və yeni bölmənin menyusunu aktiv et
    const menuLinks = document.querySelectorAll('.sidebar-menu a, .submenu a');
    menuLinks.forEach(link => link.classList.remove('active'));

    const targetMenuLink = document.querySelector(`[onclick*="${targetSectionId}"]`);
    if (targetMenuLink) {
        targetMenuLink.classList.add('active');

        // Əgər həmin düymə alt-menyudadırsa (submenu), üst menyunu da genişləndir
        const parentSubmenu = targetMenuLink.closest('.submenu');
        if (parentSubmenu) {
            parentSubmenu.style.display = 'block';
            const parentToggle = parentSubmenu.previousElementSibling;
            if (parentToggle) {
                parentToggle.classList.add('active');
            }
        }
    }

    // 3. Səhifəni rəvan şəkildə yuxarıya sürüşdür
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
// Nümunə API sorğusu ümumi baxış rəqəmləri kartlara çəkmək üçün
fetch('/api/statistics')
    .then(response => response.json())
    .then(data => {
        document.getElementById('val-isle-temin').innerText = data.isleTeminSayi;
        document.getElementById('pop-isle-kisi').innerText = data.isleKisiSayi;
        // və sair...
    });
// VAKANSİYALAR ÜÇÜN BACKEND KODLARI
function fetchVacancyData() {
    // 1. Filtrlərdən seçilən dəyərləri oxuyuruq
    const year = document.getElementById('vacYearFilter').value;
    const month = document.getElementById('vacMonthFilter').value;
    const region = document.getElementById('vacRegionFilter').value;
    const education = document.getElementById('vacEducationFilter').value;
    const gender = document.getElementById('vacGenderFilter').value;

    // 2. Backend API ünvanına parametrləri ötürürük (URLSearchParams vasitəsilə)
    const params = new URLSearchParams({ year, month, region, education, gender });

    fetch(`/api/vacancies?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            // 3. Gələn cavaba əsasən ID-ləri yeniləyirik
            document.getElementById('val-total-vac').innerText = data.totalVacancies;
            document.getElementById('lbl-dovlet').innerText = data.dovlet;
            document.getElementById('lbl-qeyridovlet').innerText = data.qeyridovlet;
            document.getElementById('lbl-qulluqcu').innerText = data.qulluqcu;
            document.getElementById('lbl-fehle').innerText = data.fehle;

            // Rayonlar üzrə dövrü məlumatların yenilənməsi...
        })
        .catch(error => console.error('Xəta baş verdi:', error));
}
// Çoxlu seçilən bəndlərin dəyərlərini backend üçün massiv şəklində toplayan funksiya
function getSelectedComboValues(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];

    const checkboxes = container.querySelectorAll('.combo-options-list input[type="checkbox"]:not(.select-all-cb):checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// Vakansiya Filtrləri dəyişdikdə çağırılan backend sorğu funksiyası
function fetchVacancyData() {
    // 1. Çoxlu seçilmiş bəndləri massiv şəklində götürürük
    const selectedYears = getSelectedComboValues('vacComboYear');       // örnək: ['2026', '2025']
    const selectedMonths = getSelectedComboValues('vacComboMonth');     // örnək: ['Yanvar', 'Fevral']
    const selectedRegions = getSelectedComboValues('vacComboRegion');   // örnək: ['Naxçıvan', 'Şərur']
    const selectedEdus = getSelectedComboValues('vacComboEdu');         // örnək: ['Ali']
    const selectedGenders = getSelectedComboValues('vacComboGender');   // örnək: ['Kisi']

    // 2. Backend API üçün JSON obyekti yaradırıq
    const filterPayload = {
        years: selectedYears,
        months: selectedMonths,
        regions: selectedRegions,
        educations: selectedEdus,
        genders: selectedGenders
    };

    console.log("Backend-ə göndərilən filtrlər:", filterPayload);

    /* 3. Backend Sorğusu (AJAX / Fetch)
    fetch('/api/vacancies/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterPayload)
    })
    .then(response => response.json())
    .then(data => {
        // Gələn məlumatlara əsasən kartları və diaqramları yeniləyin
    });
    */
}
// 1. Dropdown pəncərəsini açıb/bağlayan funksiya
function toggleComboBox(comboId) {
    event.stopPropagation();
    const combo = document.getElementById(comboId);
    const dropdown = combo.querySelector('.combo-dropdown');

    // Digər açıq dropdown-ları bağla
    document.querySelectorAll('.combo-dropdown').forEach(d => {
        if (d !== dropdown) d.style.display = 'none';
    });

    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
    } else {
        dropdown.style.display = 'block';
    }
}

// 2. Dropdown daxilində axtarış funksiyası
function filterComboItems(comboId, query) {
    const combo = document.getElementById(comboId);
    const labels = combo.querySelectorAll('.combo-options-list label:not(.select-all-label)');
    const q = query.toLowerCase();

    labels.forEach(label => {
        const text = label.textContent.toLowerCase();
        if (text.includes(q)) {
            label.style.display = 'flex';
        } else {
            label.style.display = 'none';
        }
    });
}

// 3. "Hamısını seç" funksiyası
function toggleSelectAll(comboId, isChecked) {
    const combo = document.getElementById(comboId);
    const checkboxes = combo.querySelectorAll('.combo-options-list input[type="checkbox"]:not(.select-all-cb)');

    checkboxes.forEach(cb => {
        if (cb.closest('label').style.display !== 'none') {
            cb.checked = isChecked;
        }
    });
    updateComboSelectedText(comboId);
    if (typeof fetchVacancyData === 'function') fetchVacancyData();
}

// 4. Checkbox dəyişdikdə çağırılan funksiya
function handleComboChange(comboId) {
    updateComboSelectedText(comboId);
    if (typeof fetchVacancyData === 'function') fetchVacancyData();
}

// 5. Seçilmiş elementlərin sayını və ya adını yuxarıdakı qutuda göstərən funksiya
function updateComboSelectedText(comboId) {
    const combo = document.getElementById(comboId);
    const checkboxes = combo.querySelectorAll('.combo-options-list input[type="checkbox"]:not(.select-all-cb)');
    const checked = combo.querySelectorAll('.combo-options-list input[type="checkbox"]:not(.select-all-cb):checked');
    const selectedTextSpan = combo.querySelector('.combo-selected-text');

    if (checked.length === 0) {
        selectedTextSpan.textContent = "(Seçilməyib)";
    } else if (checked.length === checkboxes.length) {
        selectedTextSpan.textContent = "(Hamısı)";
    } else {
        const values = Array.from(checked).map(cb => cb.closest('label').textContent.trim());
        selectedTextSpan.textContent = values.join(', ');
    }
}

// 6. Səhifənin boş yerinə kliklədikdə açıq dropdown-ları bağla
window.addEventListener('click', function (e) {
    if (!e.target.closest('.excel-combobox')) {
        document.querySelectorAll('.combo-dropdown').forEach(d => {
            d.style.display = 'none';
        });
    }
});
// rəhbərin tapşırıqları
function addNewNoteWithDeadline() {
    // 1. Daxil edilən dəyərləri oxuyuruq
    const titleInput = document.getElementById('noteTitleInput');
    const assigneeInput = document.getElementById('noteAssigneeInput');
    const deadlineInput = document.getElementById('noteDeadlineInput');
    const descInput = document.getElementById('noteDescInput');

    const title = titleInput.value.trim();
    const assignee = assigneeInput ? assigneeInput.value : '';
    const deadline = deadlineInput.value;
    const desc = descInput.value.trim();

    // 2. Yoxlama (Başlıq və məzmun mütləqdir)
    if (!title || !desc) {
        alert("Lütfən qeydin başlığını və məzmununu daxil edin!");
        return;
    }

    // 3. Cari Tarixi Formatlayırıq (GG.AA.İİİİ)
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;

    // 4. Dedlayn (Son tarix) üçün qalan günün hesablanması
    let deadlineBadgeHTML = '';
    if (deadline) {
        const targetDate = new Date(deadline);
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            deadlineBadgeHTML = `
                <span class="deadline-badge" style="background: #e3f2fd; color: #1976d2; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                    <i class="fa-regular fa-clock"></i> Qalan vaxt: ${diffDays} gün
                </span>`;
        } else if (diffDays === 0) {
            deadlineBadgeHTML = `
                <span class="deadline-badge" style="background: #fff3e0; color: #ef6c00; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                    <i class="fa-regular fa-clock"></i> Son gündür!
                </span>`;
        } else {
            deadlineBadgeHTML = `
                <span class="deadline-badge" style="background: #ffebee; color: #c62828; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                    <i class="fa-regular fa-clock"></i> Vaxtı bitib (${Math.abs(diffDays)} gün keçib)
                </span>`;
        }
    } else {
        deadlineBadgeHTML = `
            <span class="deadline-badge" style="background: #f5f5f5; color: #666; padding: 4px 10px; border-radius: 4px; font-size: 12px;">
                <i class="fa-regular fa-clock"></i> Dedlayn yoxdur
            </span>`;
    }

    // 5. İcraçı Şəxs Badge hazırlanması
    const assigneeHTML = assignee ? `
        <span class="assignee-badge" style="background: #eef2f3; color: #2b5256; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; border: 1px solid #d1d8d9;">
            <i class="fa-solid fa-user-check"></i> İcraçı: ${assignee}
        </span>` : `
        <span class="assignee-badge" style="background: #f5f5f5; color: #888; padding: 4px 10px; border-radius: 4px; font-size: 12px;">
            <i class="fa-solid fa-user"></i> İcraçı: Təyin edilməyib
        </span>`;

    // 6. Yeni Kart HTML karkasının daxil edilməsi
    const noteId = Date.now(); // Unikal ID
    const newNoteHTML = `
        <div class="note-card" data-note-id="${noteId}" style="position: relative; border-left: 4px solid #2b5256; padding: 15px; margin-bottom: 15px; background: #fff; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border: 1px solid #eee;">
            <div class="note-card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h4 style="margin: 0; color: #2b5256; font-size: 15px;">${title}</h4>
                <span class="note-date" style="font-size: 12px; color: #777;">Tarix: ${dateStr}</span>
            </div>
            
            <p style="margin-bottom: 12px; color: #444; font-size: 13px; line-height: 1.4;">
                ${desc}
            </p>

            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    ${assigneeHTML}
                    ${deadlineBadgeHTML}
                </div>

                <button class="btn-delete-note" onclick="this.closest('.note-card').remove()" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 14px;" title="Sil">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `;

    // 7. Kartı siyahının ən üstünə əlavə edirik
    const container = document.getElementById('notesContainer');
    container.insertAdjacentHTML('afterbegin', newNoteHTML);

    // 8. Formu sıfırlayırıq
    titleInput.value = '';
    if (assigneeInput) assigneeInput.value = '';
    deadlineInput.value = '';
    descInput.value = '';
}
// ==========================================================
// İŞLƏ TƏMİN OLUNMA BÖLMƏSİ - BÜTÜN DİAQRAMLARIN DƏYİŞMƏSİ
// ==========================================================

// 1. Üst Tab-ların Seçilməsi
function selectEmpTab(element, tabName) {
    // Qalın çərçivəni seçilən karta keçiririk
    document.querySelectorAll('.emp-card').forEach(card => {
        card.classList.remove('active-tab');
        card.style.borderColor = '#e2e8f0';
        card.style.borderWidth = '1px';
    });

    element.classList.add('active-tab');
    element.style.borderColor = '#2b5256';
    element.style.borderWidth = '2px';

    // Bütün diaqramları və sütunları seçilən tab-a uyğun yeniləyirik
    updateAllChartsAndStats(tabName);
}

// 2. Bütün Diaqramları, Sütunları və Popover-ləri Yeniləyən Əsas Funksiya
function updateAllChartsAndStats(tabName) {

    // MƏLUMAT BAZASI (Backend qoşulana qədər dynamic interaktivlik üçün)
    const empDatabase = {
        all: {
            issiz: "1 903", isaxtaran: "416", tpo: "314",
            regAddress: { "Naxçıvan": 544, "Şərur": 529, "Babək": 525, "Ordubad": 276, "Culfa": 235, "Şahbuz": 194, "Kəngərli": 199, "Sədərək": 97, "Digər": 35 },
            workAddress: { "Naxçıvan": 1423, "Şərur": 375, "Babək": 187, "Ordubad": 212, "Culfa": 144, "Şahbuz": 66, "Kəngərli": 159, "Sədərək": 68 },
            education: { "Orta təhsil": 2203, "Orta ixtisas təhsili": 134, "Ali təhsil": 296 },
            categories: { "sehid": 20, "veteran": 30, "elil": 20, "elilliyi-olan": 50, "simu": 7, "coxusaqli": 9, "pensiya": 17, "genc": 3, "kockun": 5, "cezacatdirma": 13 }
        },
        hoii: {
            issiz: "650", isaxtaran: "150", tpo: "83",
            regAddress: { "Naxçıvan": 180, "Şərur": 170, "Babək": 165, "Ordubad": 90, "Culfa": 80, "Şahbuz": 60, "Kəngərli": 65, "Sədərək": 30, "Digər": 8 },
            workAddress: { "Naxçıvan": 450, "Şərur": 120, "Babək": 70, "Ordubad": 80, "Culfa": 50, "Şahbuz": 25, "Kəngərli": 60, "Sədərək": 28 },
            education: { "Orta təhsil": 750, "Orta ixtisas təhsili": 45, "Ali təhsil": 88 },
            categories: { "sehid": 8, "veteran": 12, "elil": 6, "elilliyi-olan": 20, "simu": 3, "coxusaqli": 4, "pensiya": 8, "genc": 1, "kockun": 2, "cezacatdirma": 5 }
        },
        yarmarka: {
            issiz: "50", isaxtaran: "20", tpo: "12",
            regAddress: { "Naxçıvan": 20, "Şərur": 18, "Babək": 15, "Ordubad": 8, "Culfa": 7, "Şahbuz": 5, "Kəngərli": 5, "Sədərək": 3, "Digər": 1 },
            workAddress: { "Naxçıvan": 40, "Şərur": 12, "Babək": 8, "Ordubad": 7, "Culfa": 5, "Şahbuz": 3, "Kəngərli": 4, "Sədərək": 3 },
            education: { "Orta təhsil": 50, "Orta ixtisas təhsili": 12, "Ali təhsil": 20 },
            categories: { "sehid": 2, "veteran": 3, "elil": 1, "elilliyi-olan": 4, "simu": 1, "coxusaqli": 1, "pensiya": 1, "genc": 1, "kockun": 0, "cezacatdirma": 1 }
        },
        ebm: {
            issiz: "45", isaxtaran: "20", tpo: "9",
            regAddress: { "Naxçıvan": 18, "Şərur": 15, "Babək": 12, "Ordubad": 8, "Culfa": 7, "Şahbuz": 4, "Kəngərli": 6, "Sədərək": 3, "Digər": 1 },
            workAddress: { "Naxçıvan": 35, "Şərur": 10, "Babək": 8, "Ordubad": 6, "Culfa": 5, "Şahbuz": 2, "Kəngərli": 5, "Sədərək": 3 },
            education: { "Orta təhsil": 40, "Orta ixtisas təhsili": 14, "Ali təhsil": 20 },
            categories: { "sehid": 1, "veteran": 2, "elil": 1, "elilliyi-olan": 3, "simu": 0, "coxusaqli": 1, "pensiya": 1, "genc": 0, "kockun": 1, "cezacatdirma": 1 }
        }
    };

    const data = empDatabase[tabName] || empDatabase['all'];

    // A) Dairəvi Məşğulluq Statusu Rəqəmlərinin Yenilənməsi
    if (document.getElementById('lbl-issiz')) document.getElementById('lbl-issiz').innerText = data.issiz;
    if (document.getElementById('lbl-isaxtaran')) document.getElementById('lbl-isaxtaran').innerText = data.isaxtaran;
    if (document.getElementById('lbl-isaxtarantpo')) document.getElementById('lbl-isaxtarantpo').innerText = data.tpo;

    // B) Qeydiyyat Ünvanı Sütunlarının və Rəqəmlərinin Yenilənməsi
    updateBarChart('regAddressBarChart', data.regAddress, 544);

    // C) İş Yerinin Faktiki Ünvanı Sütunlarının Yenilənməsi
    updateBarChart('workAddressBarChart', data.workAddress, 1423);

    // D) Təhsil Səviyyəsi Zolaqlarının Yenilənməsi
    updateHorizontalChart('eduLevelChart', data.education, 2203);

    // E) Kateqoriyalar Üzrə Sütunların Yenilənməsi
    updateCategoryChart('categoryBarChart', data.categories, 50);
}

// 3. Şaquli Sütunları Proporsional Şəkildə Böyüdüb-Kiçildən Köməkçi Funksiya
function updateBarChart(containerId, chartData, maxVal) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const wrappers = container.querySelectorAll('.single-bar-wrapper');
    wrappers.forEach(wrapper => {
        const regionName = wrapper.querySelector('span:last-of-type')?.innerText.trim();
        if (regionName && chartData[regionName] !== undefined) {
            const newVal = chartData[regionName];

            // Üstündəki rəqəmi dəyişirik
            const valSpan = wrapper.querySelector('.bar-val');
            if (valSpan) valSpan.innerText = newVal;

            // Sütunun hündürlüyünü faizlə yeniləyirik
            const bar = wrapper.querySelector('.bar-teal');
            if (bar) {
                const newHeight = Math.max(8, Math.round((newVal / maxVal) * 110));
                bar.style.height = `${newHeight}px`;
            }
        }
    });
}

// 4. Üfüqi Zolaqları Yeniləyən Funksiya (Təhsil Səviyyəsi)
function updateHorizontalChart(containerId, chartData, maxVal) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const rows = container.querySelectorAll('.single-hbar-wrapper');
    rows.forEach(row => {
        const labelText = row.querySelector('.h-label')?.innerText.trim();
        if (labelText && chartData[labelText] !== undefined) {
            const newVal = chartData[labelText];

            const valSpan = row.querySelector('.h-bar-val');
            if (valSpan) valSpan.innerText = newVal;

            const bar = row.querySelector('.bar-teal');
            if (bar) {
                const newWidth = Math.max(10, Math.round((newVal / maxVal) * 85));
                bar.style.width = `${newWidth}%`;
            }
        }
    });
}

// 5. Kateqoriyalar Bölməsini Yeniləyən Funksiya
function updateCategoryChart(containerId, categoryData, maxVal) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const wrappers = container.querySelectorAll('.single-bar-wrapper');
    wrappers.forEach((wrapper, index) => {
        const keys = Object.keys(categoryData);
        if (keys[index]) {
            const newVal = categoryData[keys[index]];

            const valSpan = wrapper.querySelector('.bar-val');
            if (valSpan) valSpan.innerText = newVal;

            const bar = wrapper.querySelector('.bar-teal');
            if (bar) {
                const newHeight = Math.max(10, Math.round((newVal / maxVal) * 110));
                bar.style.height = `${newHeight}px`;
            }
        }
    });
}
// ==========================================================
// ÖZÜNÜMƏŞĞULLUQ - SEKTORLARA GÖRƏ DİAQRAMLARI DƏYİŞDİRƏN JS
// ==========================================================

function selectOzunSector(element, sectorName) {
    // Kartların aktivlik border dizaynını yeniləyirik
    document.querySelectorAll('.ozun-tab-card').forEach(card => {
        card.style.borderColor = '#e2e8f0';
        card.style.borderWidth = '1px';
    });
    element.style.borderColor = '#2b5256';
    element.style.borderWidth = '2px';

    // Sektor üzrə məlumat bazası (Nümunə simulyasiya)
    const sectorDatabase = {
        all: {
            regions: { "Naxçıvan": { t: 619, k: 348, q: 271 }, "Şərur": { t: 51, k: 29, q: 22 }, "Babək": { t: 105, k: 58, q: 47 }, "Ordubad": { t: 52, k: 28, q: 24 }, "Culfa": { t: 144, k: 81, q: 63 }, "Şahbuz": { t: 48, k: 26, q: 22 }, "Kəngərli": { t: 15, k: 8, q: 7 }, "Sədərək": { t: 17, k: 10, q: 7 } }
        },
        kend: {
            regions: { "Naxçıvan": { t: 300, k: 170, q: 130 }, "Şərur": { t: 30, k: 18, q: 12 }, "Babək": { t: 60, k: 35, q: 25 }, "Ordubad": { t: 25, k: 14, q: 11 }, "Culfa": { t: 80, k: 45, q: 35 }, "Şahbuz": { t: 25, k: 14, q: 11 }, "Kəngərli": { t: 8, k: 4, q: 4 }, "Sədərək": { t: 10, k: 6, q: 4 } }
        },
        istehsal: {
            regions: { "Naxçıvan": { t: 100, k: 55, q: 45 }, "Şərur": { t: 8, k: 4, q: 4 }, "Babək": { t: 15, k: 8, q: 7 }, "Ordubad": { t: 10, k: 5, q: 5 }, "Culfa": { t: 24, k: 14, q: 10 }, "Şahbuz": { t: 8, k: 4, q: 4 }, "Kəngərli": { t: 3, k: 2, q: 1 }, "Sədərək": { t: 3, k: 2, q: 1 } }
        },
        xidmet: {
            regions: { "Naxçıvan": { t: 219, k: 123, q: 96 }, "Şərur": { t: 13, k: 7, q: 6 }, "Babək": { t: 30, k: 15, q: 15 }, "Ordubad": { t: 17, k: 9, q: 8 }, "Culfa": { t: 40, k: 22, q: 18 }, "Şahbuz": { t: 15, k: 8, q: 7 }, "Kəngərli": { t: 4, k: 2, q: 2 }, "Sədərək": { t: 4, k: 2, q: 2 } }
        }
    };

    const currentData = sectorDatabase[sectorName] || sectorDatabase['all'];
    updateOzunRegionChart(currentData.regions);
}

// Rayon qrafiklərinin və popover-lərin dəyərlərini yeniləyən funksiya
function updateOzunRegionChart(regionsMap) {
    const container = document.getElementById('ozunRegionChart');
    if (!container) return;

    const rows = container.querySelectorAll('.single-hbar-wrapper');
    rows.forEach(row => {
        const labelEl = row.querySelector('.h-label');
        if (!labelEl) return;
        const regionName = labelEl.innerText.trim();

        if (regionsMap[regionName]) {
            const vals = regionsMap[regionName];

            // Ümumi rəqəm
            const valSpan = row.querySelector('.h-bar-val');
            if (valSpan) valSpan.innerText = vals.t;

            // Zolağın eni (max 619 əsas alınaraq faiz hesablanır)
            const bar = row.querySelector('.bar-teal');
            if (bar) {
                const widthPercent = Math.max(5, Math.round((vals.t / 619) * 100));
                bar.style.width = `${widthPercent}%`;
            }

            // Popover daxilindəki kişi və qadın sayları
            const popTotal = row.querySelector('.pop-total');
            const popKisi = row.querySelector('.pop-kisi');
            const popQadin = row.querySelector('.pop-qadin');

            if (popTotal) popTotal.innerText = vals.t;
            if (popKisi) popKisi.innerText = vals.k;
            if (popQadin) popQadin.innerText = vals.q;
        }
    });
}
// Rayon sətirlərinə JavaScript vasitəsilə hover effekti əlavə edirik
document.addEventListener("DOMContentLoaded", function () {
    const rows = document.querySelectorAll('.h-bar-row-single');

    rows.forEach(row => {
        const popover = row.querySelector('.hbar-popover');
        if (!popover) return;

        row.addEventListener('mouseenter', () => {
            popover.style.display = 'block';
        });

        row.addEventListener('mouseleave', () => {
            popover.style.display = 'none';
        });
    });
});
document.addEventListener("DOMContentLoaded", function () {
    // Rayon sətrlərini tapırıq
    const rows = document.querySelectorAll('#peseRegionChart .h-bar-row-single');

    // Səhifəyə tək bir popover elementi əlavə edirik (bütün sətirlər üçün ortaq istifadə olunacaq)
    let tooltip = document.getElementById('global-hover-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'global-hover-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: #1e293b;
            color: #ffffff;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-family: inherit;
            white-space: nowrap;
            z-index: 999999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            pointer-events: none;
            display: none;
        `;
        document.body.appendChild(tooltip);
    }

    rows.forEach(row => {
        row.addEventListener('mouseenter', (e) => {
            const regionName = row.getAttribute('data-region') || row.querySelector('.h-label')?.innerText.trim();
            const totalVal = row.querySelector('.h-bar-val')?.innerText.trim() || "0";

            // Sadə demo saylar (və ya HTML-dəki popover-dən oxuya bilərsiniz)
            // Real məlumatları buradan və ya HTML içindəki strukturdan ala bilərik
            let kisi = "–", qadin = "–";
            const popoverInner = row.querySelector('.single-bar-popover, .bar-hover-popover');

            if (popoverInner) {
                // Əgər HTML-də popover varsa oradakı rəqəmləri oxuyuruq
                const textHTML = popoverInner.innerHTML;
                tooltip.innerHTML = textHTML;
            } else {
                // Əks halda ümumi dəyəri göstəririk
                tooltip.innerHTML = `<b>${regionName}</b><br>Ümumi: ${totalVal}`;
            }

            tooltip.style.display = 'block';
        });

        row.addEventListener('mousemove', (e) => {
            // Kursoru izləyərək popover-i hərəkət etdiririk
            tooltip.style.left = (e.pageX + 12) + 'px';
            tooltip.style.top = (e.pageY - 28) + 'px';
        });

        row.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    });
});
// ==========================================================
// HAQQI ÖDƏNİLƏN İCTİMAİ İŞLƏR BÖLMƏSİ (JAVASCRIPT)
// ==========================================================

const publicData = {
    kvota: {
        titleSuffix: "Kvota",
        institutions: [
            { name: "Kommunal Müəssisələr Kombinatı", val: 1961, pct: 95 },
            { name: "Dini Qurumlarla İş üzrə Dövlət Komitəsi", val: 48, pct: 25 },
            { name: "Naxçıvan Avtomobil Yolları Dövlət agentliyi", val: 43, pct: 22 },
            { name: "Ekologiya və Təbii Sərvətlər Nazirliyi", val: 32, pct: 16 },
            { name: "Kənd Təsərrüfatı Nazirliyi", val: 32, pct: 16 },
            { name: "Naxçıvan Yaşıllaşdırma xidməti", val: 56, pct: 34 },
            { name: "Naxçıvan Dövlət Energetika Xidməti", val: 45, pct: 30 },
            { name: "Kənd Təsərrüfatı Nazirliyi", val: 32, pct: 16 }
        ],
        regions: [
            { name: "Naxçıvan şəhəri", val: 120, height: 30, kisi: 45, qadin: 75 },
            { name: "Şərur rayonu", val: 444, height: 95, kisi: 200, qadin: 244 },
            { name: "Babək rayonu", val: 335, height: 80, kisi: 150, qadin: 185 },
            { name: "Ordubad rayonu", val: 315, height: 75, kisi: 140, qadin: 175 },
            { name: "Culfa rayonu", val: 365, height: 85, kisi: 160, qadin: 205 },
            { name: "Şahbuz rayonu", val: 252, height: 60, kisi: 110, qadin: 142 },
            { name: "Kəngərli rayonu", val: 155, height: 40, kisi: 70, qadin: 85 },
            { name: "Sədərək rayonu", val: 145, height: 35, kisi: 65, qadin: 80 }
        ],
        gender: { kisi: 1100, qadin: 1400 }
    },
    celb: {
        titleSuffix: "Ümumi cəlb olunan",
        institutions: [
            { name: "Kommunal Müəssisələr Kombinatı", val: 2150, pct: 98 },
            { name: "Dini Qurumlarla İş üzrə Dövlət Komitəsi", val: 60, pct: 30 },
            { name: "Naxçıvan Avtomobil Yolları Dövlət agentliyi", val: 55, pct: 25 },
            { name: "Ekologiya və Təbii Sərvətlər Nazirliyi", val: 45, pct: 20 },
            { name: "Kənd Təsərrüfatı Nazirliyi", val: 40, pct: 28 },
            { name: "Naxçıvan Yaşıllaşdırma xidməti", val: 32, pct: 30 },
            { name: "Naxçıvan Dövlət Energetika Xidməti", val: 18, pct: 16 },
            { name: "Kənd Təsərrüfatı Nazirliyi", val: 56, pct: 34 }
        ],
        regions: [
            { name: "Naxçıvan şəhəri", val: 156, height: 35, kisi: 60, qadin: 96 },
            { name: "Şərur rayonu", val: 522, height: 110, kisi: 220, qadin: 302 },
            { name: "Babək rayonu", val: 430, height: 90, kisi: 180, qadin: 250 },
            { name: "Ordubad rayonu", val: 355, height: 75, kisi: 150, qadin: 205 },
            { name: "Culfa rayonu", val: 417, height: 85, kisi: 170, qadin: 247 },
            { name: "Şahbuz rayonu", val: 290, height: 65, kisi: 120, qadin: 170 },
            { name: "Kəngərli rayonu", val: 171, height: 45, kisi: 75, qadin: 96 },
            { name: "Sədərək rayonu", val: 200, height: 50, kisi: 85, qadin: 115 }
        ],
        gender: { kisi: 1250, qadin: 1603 }
    },
    xitam: {
        titleSuffix: "Xitam verilən",
        institutions: [
            { name: "Kommunal Müəssisələr Kombinatı", val: 520, pct: 90 },
            { name: "Dini Qurumlarla İş üzrə Dövlət Komitəsi", val: 15, pct: 20 },
            { name: "Naxçıvan Avtomobil Yolları Dövlət agentliyi", val: 12, pct: 18 },
            { name: "Ekologiya və Təbii Sərvətlər Nazirliyi", val: 10, pct: 15 },
            { name: "Kənd Təsərrüfatı Nazirliyi", val: 8, pct: 12 },
            { name: "Naxçıvan Yaşıllaşdırma xidməti", val: 32, pct: 28 },
            { name: "Naxçıvan Dövlət Energetika Xidməti", val: 24, pct: 24 },
            { name: "Kənd Təsərrüfatı Nazirliyi", val: 22, pct: 18 }
        ],
        regions: [
            { name: "Naxçıvan şəhəri", val: 63, height: 30, kisi: 25, qadin: 38 },
            { name: "Şərur rayonu", val: 95, height: 50, kisi: 40, qadin: 55 },
            { name: "Babək rayonu", val: 112, height: 60, kisi: 45, qadin: 67 },
            { name: "Ordubad rayonu", val: 55, height: 30, kisi: 22, qadin: 33 },
            { name: "Culfa rayonu", val: 66, height: 35, kisi: 26, qadin: 40 },
            { name: "Şahbuz rayonu", val: 55, height: 30, kisi: 22, qadin: 33 },
            { name: "Kəngərli rayonu", val: 49, height: 25, kisi: 20, qadin: 29 },
            { name: "Sədərək rayonu", val: 62, height: 32, kisi: 25, qadin: 37 }
        ],
        gender: { kisi: 265, qadin: 398 }
    },
    aktiv: {
        titleSuffix: "Aktiv işçi",
        institutions: [
            { name: "Kommunal Müəssisələr Kombinatı", val: 1961, pct: 95 },
            { name: "Dini Qurumlarla İş üzrə Dövlət Komitəsi", val: 48, pct: 25 },
            { name: "Naxçıvan Avtomobil Yolları Dövlət agentliyi", val: 43, pct: 22 },
            { name: "Ekologiya və Təbii Sərvətlər Nazirliyi", val: 32, pct: 16 },
            { name: "Kənd Təsərrüfatı Nazirliyi", val: 32, pct: 30 },
            { name: "Naxçıvan Yaşıllaşdırma xidməti", val: 44, pct: 35 },
            { name: "Naxçıvan Dövlət Energetika Xidməti", val: 16, pct: 16 },
            { name: "Kənd Təsərrüfatı Nazirliyi", val: 14, pct: 13 }
        ],
        regions: [
            { name: "Naxçıvan şəhəri", val: 112, height: 30, kisi: 45, qadin: 67 },
            { name: "Şərur rayonu", val: 356, height: 95, kisi: 140, qadin: 216 },
            { name: "Babək rayonu", val: 392, height: 105, kisi: 155, qadin: 237 },
            { name: "Ordubad rayonu", val: 261, height: 70, kisi: 105, qadin: 156 },
            { name: "Culfa rayonu", val: 297, height: 80, kisi: 120, qadin: 177 },
            { name: "Şahbuz rayonu", val: 243, height: 65, kisi: 98, qadin: 145 },
            { name: "Kəngərli rayonu", val: 258, height: 70, kisi: 104, qadin: 154 },
            { name: "Sədərək rayonu", val: 162, height: 45, kisi: 65, qadin: 97 }
        ],
        gender: { kisi: 858, qadin: 1281 }
    },
    vakant: {
        titleSuffix: "Vakant yerlər",
        institutions: [
            { name: "Kommunal Müəssisələr Kombinatı", val: 210, pct: 85 },
            { name: "Dini Qurumlarla İş üzrə Dövlət Komitəsi", val: 12, pct: 13 },
            { name: "Naxçıvan Avtomobil Yolları Dövlət agentliyi", val: 57, pct: 57 },
            { name: "Ekologiya və Təbii Sərvətlər Nazirliyi", val: 28, pct: 34 },
            { name: "Kənd Təsərrüfatı Nazirliyi", val: 25, pct: 30 },
            { name: "Naxçıvan Yaşıllaşdırma xidməti", val: 33, pct: 24 },
            { name: "Naxçıvan Dövlət Energetika Xidməti", val: 28, pct: 19 },
            { name: "Kənd Təsərrüfatı Nazirliyi", val: 45, pct: 33 }
        ],
        regions: [
            { name: "Naxçıvan şəhəri", val: 44, height: 40, kisi: 20, qadin: 24 },
            { name: "Şərur rayonu", val: 50, height: 45, kisi: 25, qadin: 25 },
            { name: "Babək rayonu", val: 40, height: 35, kisi: 18, qadin: 22 },
            { name: "Ordubad rayonu", val: 35, height: 30, kisi: 15, qadin: 20 },
            { name: "Culfa rayonu", val: 45, height: 40, kisi: 20, qadin: 25 },
            { name: "Şahbuz rayonu", val: 38, height: 35, kisi: 18, qadin: 20 },
            { name: "Kəngərli rayonu", val: 30, height: 28, kisi: 14, qadin: 16 },
            { name: "Sədərək rayonu", val: 28, height: 25, kisi: 12, qadin: 16 }
        ],
        gender: { kisi: 142, qadin: 168 }
    }
};

function updatePublicCharts(type) {
    // Aktiv kart sinfini dəyişirik
    document.querySelectorAll('.pub-stat-btn').forEach(card => card.classList.remove('active'));
    const activeBtn = document.querySelector(`.pub-stat-btn[data-type="${type}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    const data = publicData[type];
    if (!data) return;

    // Başlıqları yeniləyirik
    const instTitle = document.getElementById('institutionsTitle');
    const subTitle = document.getElementById('sectionSubTitle');
    const regTitle = document.getElementById('regionChartTitle');

    if (instTitle) instTitle.innerText = `İcraçı qurumlar üzrə bölgü (${data.titleSuffix})`;
    if (subTitle) subTitle.innerText = `${data.titleSuffix} rayon bölgüsü`;
    if (regTitle) regTitle.innerText = `${data.titleSuffix} üzrə qeydiyyat bölgüsü`;

    // İcraçı qurumlar qrafikini yeniləyirik
    let instHtml = '';
    data.institutions.forEach(inst => {
        instHtml += `
            <div class="h-bar-row-single"><span class="h-label">${inst.name}</span>
                <div class="h-bar-track">
                    <div class="bar-teal" style="width: ${inst.pct}%;"></div><span class="h-bar-val">${inst.val.toLocaleString()}</span>
                </div>
            </div>`;
    });
    const instContainer = document.getElementById('institutionsBarChart');
    if (instContainer) instContainer.innerHTML = instHtml;

    // Rayonlar qrafikini yeniləyirik (Dikinə sütunlar və hover popover)
    let regHtml = '';
    data.regions.forEach(reg => {
        regHtml += `
            <div class="single-bar-group" data-region="${reg.name}" onmouseenter="this.querySelector('.bar-hover-popover').style.display='block'" onmouseleave="this.querySelector('.bar-hover-popover').style.display='none'" style="position: relative; cursor: pointer;">
                <span class="bar-val">${reg.val}</span>
                <div class="bar-teal" style="height: ${reg.height}px; width: 28px !important; border-radius: 6px 6px 0 0;"></div>
                <span>${reg.name}</span>
                <div class="bar-hover-popover" style="display: none; position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%); background: #1e293b; color: #fff; padding: 6px 10px; border-radius: 6px; font-size: 11px; z-index: 9999; white-space: nowrap;">
                    <div><b>Kişi:</b> <span>${reg.kisi}</span></div>
                    <div><b>Qadın:</b> <span>${reg.qadin}</span></div>
                </div>
            </div>`;
    });
    const regContainer = document.getElementById('pubActiveRegBarChart');
    if (regContainer) regContainer.innerHTML = regHtml;

    // Gender rəqəmlərini yeniləyirik
    const valKisi = document.getElementById('val-gender-kisi');
    const valQadin = document.getElementById('val-gender-qadin');
    const lblKisi = document.getElementById('lbl-pub-kisi');
    const lblQadin = document.getElementById('lbl-pub-qadin');

    if (valKisi) valKisi.innerText = data.gender.kisi;
    if (valQadin) valQadin.innerText = data.gender.qadin;
    if (lblKisi) lblKisi.innerText = data.gender.kisi;
    if (lblQadin) lblQadin.innerText = data.gender.qadin;
}

function handlePubFilter() {
    // Filtrlər dəyişdikdə aktiv kartın göstəricilərini yenidən tətbiq edirik
    const activeCard = document.querySelector('.pub-stat-btn.active');
    if (activeCard) {
        updatePublicCharts(activeCard.getAttribute('data-type'));
    }
}

// Səhifə yüklənəndə ilkin olaraq 'kvota' məlumatlarını göstəririk
document.addEventListener("DOMContentLoaded", function () {
    updatePublicCharts('kvota');
});
// ==========================================================
// KƏND-RAYON İYERARXİYASI VƏ 3 KART ÜÇÜN JAVASCRIPT
// ==========================================================

const pubUniqueStructure = {
    "Babək": ["Babək", "Cəhri", "Nehrəm", "Aşağı Buzqov", "Aşağı Yaqut", "Badaşqan", "Bulğan", "Buzqov", "Çeşməbasar", "Didivar", "Gahab", "Göynük", "Gümür", "Güznüt", "Hacıvar", "Xal-Xal", "Kərimbəyli", "Kültəpə", "Məzrə", "Nəhəcrik", "Nəzərabad", "Payız", "Şıxmahmud", "Sirab", "Tumbul", "Vayxır", "Yarımca", "Yuxarı Buzqov", "Zeynəddin"],
    "Culfa": ["Culfa", "Boyəhməd", "Bənəniyar", "Camaldın", "Dizə", "Əbrəqunus", "Əlincə", "Ərəfsə", "Ərəzin", "Gal", "Göydərə", "Göynük", "Gülüstan", "Xanəgah", "Xoşkeşin", "Kırna", "Qazançı", "Qızılca", "Ləkətağ", "Milax", "Nəhəcir", "Saltaq", "Şurud", "Teyvaz", "Yaycı"],
    "Kəngərli": ["Qıvraq", "Böyükdüz", "Çalxanqala", "Qabıllı", "Qarabağlar", "Şahtaxtı", "Təzəkənd", "Xıncab", "Xok", "Yeni Kərki", "Yurdçu"],
    "Ordubad": ["Ordubad", "Şəhriyar", "Parağaçay", "Ağrı", "Ələhi", "Əlisər", "Anaqut", "Əndəmic", "Aşağı Aza", "Aşağı Əylis", "Baş Dizə", "Baş Kənd", "Biləv", "Bist", "Bırut", "Çennəb", "Darkənd", "Dəstə", "Dirnis", "Düyylün", "Əynəzər", "Gənzə", "Gilançay", "Xanağa", "Kələki", "Kələntər Dizə", "Kilit", "Kotam", "Nüsnüs", "Pazmar", "Sabirkənd", "Sərxan", "Tişivi", "Unus", "Üstüpü", "Vanand", "Vələver", "Vənənd", "Yuxarı Aza", "Yuxarı Əndəmic", "Yuxarı Əylis", "Zənnən"],
    "Sədərək": ["Heydərabad", "Dəmirçi", "Qaraağac", "Sədərək", "Kərki"],
    "Şahbuz": ["Şahbuz", "Badamlı qəsəbəsi", "Ağbulaq", "Ayrınç", "Badamlı", "Biçənək", "Daylaqlı", "Ərikli", "Əsədabad", "Gömür", "Güney Qışlaq", "Keçili", "Kolanı", "Kükü", "Mahmudoba", "Mərəlik", "Nursu", "Sələsüz", "Şada", "Türkeş", "Vaqif", "Yuxarı Qışlaq", "Zirəmli"],
    "Şərur": ["Şərur", "Axura", "Aşağı Aralıq", "Aşağı Daşarx", "Aşlama", "Çomaxtur", "Dəmirçi", "Dənzik", "Dizə", "Dudengə", "Əbülfəzqan", "Əhədabad", "Ərəbyengicə", "Gümüşlü", "Havuş", "İbadulla", "İmamqulukənd", "Xanlıqlar", "Xələc", "Kərimbəyli", "Qara Həsənli", "Qarabağlar", "Qarxun", "Qazançı", "Qışlaqabbas", "Qorçulu", "Muğanlı", "Oğlanqala", "Püsyan", "Siyaqut", "Şahbulaq", "Şəhriyar", "Tənənəm", "Təzəkənd", "Vərməziyar", "Yuxarı Aralıq", "Yuxarı Daşarx", "Yengicə", "Zeyvə"],
    "Naxçıvan": ["Naxçıvan", "Əliabad", "Başbaşı", "Qaraxanbəyli", "Tumbul"]
};

function pubOnRegionChange() {
    const selectedRegionCbs = document.querySelectorAll('#pubUniqueComboRegion .combo-options-list input[type="checkbox"]:not(.select-all-cb):checked');
    const selectedRegions = Array.from(selectedRegionCbs).map(cb => cb.value);

    const villageListContainer = document.getElementById('pubUniqueVillageOptionsList');
    if (!villageListContainer) return;

    let targetVillages = [];

    if (selectedRegions.length === 0) {
        Object.keys(pubUniqueStructure).forEach(reg => {
            targetVillages = targetVillages.concat(pubUniqueStructure[reg]);
        });
    } else {
        selectedRegions.forEach(reg => {
            if (pubUniqueStructure[reg]) {
                targetVillages = targetVillages.concat(pubUniqueStructure[reg]);
            }
        });
    }

    targetVillages = [...new Set(targetVillages)];

    let html = `
        <label class="select-all-label" style="display:flex; align-items:center; gap:6px; cursor:pointer;">
            <input type="checkbox" class="select-all-cb" onchange="pubToggleSelectAllVillages(this.checked)">
            <b>(Hamısını seç)</b>
        </label>
        <hr class="combo-divider" style="border:0; border-top:1px solid #e2e8f0; margin:4px 0;">
    `;

    targetVillages.forEach(v => {
        html += `<label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" value="${v}" onchange="pubHandleFilter()"> ${v}</label>`;
    });

    villageListContainer.innerHTML = html;
    pubUpdateComboSelectedText('pubUniqueComboRegion');
    pubHandleFilter();
}

function pubToggleSelectAllRegions(checked) {
    const cbs = document.querySelectorAll('#pubUniqueComboRegion .combo-options-list input[type="checkbox"]:not(.select-all-cb)');
    cbs.forEach(cb => cb.checked = checked);
    pubOnRegionChange();
}

function pubToggleSelectAllVillages(checked) {
    const cbs = document.querySelectorAll('#pubUniqueVillageOptionsList input[type="checkbox"]:not(.select-all-cb)');
    cbs.forEach(cb => cb.checked = checked);
    pubUpdateComboSelectedText('pubUniqueComboVillage');
    pubHandleFilter();
}

function pubUpdateComboSelectedText(comboId) {
    const combo = document.getElementById(comboId);
    if (!combo) return;
    const checkedCbs = combo.querySelectorAll('.combo-options-list input[type="checkbox"]:not(.select-all-cb):checked');
    const textSpan = combo.querySelector('.combo-selected-text');
    if (checkedCbs.length === 0) {
        textSpan.innerText = "(Hamısı)";
    } else if (checkedCbs.length === 1) {
        textSpan.innerText = checkedCbs[0].value;
    } else {
        textSpan.innerText = `Seçilib (${checkedCbs.length})`;
    }
}

function pubUpdateCharts(type) {
    document.querySelectorAll('.pub-stat-btn').forEach(card => card.classList.remove('active'));
    const activeBtn = document.querySelector(`.pub-stat-btn[data-type="${type}"]`);
    if (activeBtn) activeBtn.classList.add('active');
}

function pubHandleFilter() {
    pubUpdateComboSelectedText('pubUniqueComboVillage');
}

document.addEventListener("DOMContentLoaded", function () {
    pubOnRegionChange();
});
