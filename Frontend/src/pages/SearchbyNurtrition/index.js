import { useLocation } from "react-router-dom";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import SearchNutritionScroll from "../../components/SearchNutritionScroll";
import './style.css'

const SearchbyNurtrition = () => {

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const coords = {lat: queryParams.get('lat'), lng: queryParams.get('lng')}


    return (
    <div className="searchbynurtritioncontents">
        <div className="nutritionheader"><HeaderContainer/></div>
        <div className="nutritionScroll"><SearchNutritionScroll coords={coords}/></div>
    </div>
)
}

export default SearchbyNurtrition