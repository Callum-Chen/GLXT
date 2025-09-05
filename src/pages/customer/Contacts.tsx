import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "@/contexts/themeContext";
import { toast } from "sonner";

interface Contact {
    id: string;
    customer: string;
    customerContact: string;
    department: string;
    email: string;
    whatsapp: string;
    contactMethod: string;
    phone: string;
    tags: string;
    owner: string;
    lastFollowUp: string;
    attachmentCount: number;
}

const CustomerContacts = () => {
    const {
        config
    } = useContext(ThemeContext);

    const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(50);
    const [sortField, setSortField] = useState("customer");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

    const [selectedFilters, setSelectedFilters] = useState({
        field1: "",
        operator: "",
        value: ""
    });

    useEffect(() => {
        const mockData: Contact[] = Array.from({
            length: 322
        }, (_, i) => ({
            id: `contact-${i + 1}`,
            customer: i % 5 === 0 ? "CPPSOLO" : i % 3 === 0 ? "GLOBAL" : "TECHNOLOGY",
            customerContact: i % 2 === 0 ? "Lu" : i % 3 === 0 ? "Zhang" : "Wang",
            department: i % 4 === 0 ? "H亚洲区" : i % 3 === 0 ? "E欧洲区" : "A美洲区",
            email: i % 2 === 0 ? "lude@youxiang.com" : `contact${i}@example.com`,
            whatsapp: i % 3 === 0 ? "+" + Math.floor(Math.random() * 1000000000).toString() : "-",
            contactMethod: i % 2 === 0 ? "-" : "电话",
            phone: i % 2 === 0 ? "-" : "+" + Math.floor(Math.random() * 1000000000).toString(),
            tags: i % 3 === 0 ? "VIP" : i % 2 === 0 ? "潜在客户" : "-",
            owner: i % 4 === 0 ? "卢晓程" : i % 3 === 0 ? "张经理" : i % 2 === 0 ? "王销售" : "李主管",
            lastFollowUp: i % 5 === 0 ? "2025-09-01" : i % 3 === 0 ? "2025-08-28" : "-",
            attachmentCount: Math.floor(Math.random() * 5)
        }));

        setContacts(mockData);
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const {
            name,
            value
        } = e.target;

        setSelectedFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {
            name,
            value
        } = e.target;

        setSelectedFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleQuery = () => {
        toast.info("查询条件已应用");
        setCurrentPage(1);
    };

    const handleReset = () => {
        setSelectedFilters({
            field1: "",
            operator: "",
            value: ""
        });

        setSearchTerm("");
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleBatchAction = (action: string) => {
        if (selectedRecords.length === 0) {
            toast.error("请先选择记录");
            return;
        }

        switch (action) {
        case "recycle":
            toast.success(`已将 ${selectedRecords.length} 条记录移至回收站`);
            setSelectedRecords([]);
            break;
        default:
            toast.info(`执行 ${action} 操作`);
        }
    };

    const filteredContacts = contacts.filter(
        contact => contact.customer.toLowerCase().includes(searchTerm.toLowerCase()) || contact.customerContact.toLowerCase().includes(searchTerm.toLowerCase()) || contact.email.toLowerCase().includes(searchTerm.toLowerCase()) || contact.phone.includes(searchTerm)
    ).sort((a, b) => {
        if (a[sortField as keyof Contact] < b[sortField as keyof Contact]) {
            return sortDirection === "asc" ? -1 : 1;
        }

        if (a[sortField as keyof Contact] > b[sortField as keyof Contact]) {
            return sortDirection === "asc" ? 1 : -1;
        }

        return 0;
    });

    const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
    const paginatedContacts = filteredContacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    return <></>;
};

export default CustomerContacts;